import {
  createSupportTicket,
  uploadAttachment,
} from '@linode/api-v4/lib/support';
import { APIError } from '@linode/api-v4/lib/types';
import * as Bluebird from 'bluebird';
import { update } from 'ramda';
import * as React from 'react';
import { Accordion } from 'src/components/Accordion';
import { StyledActionPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Button } from 'src/components/Button/Button';
import FormHelperText from 'src/components/core/FormHelperText';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import { Typography } from 'src/components/Typography';
import { Dialog } from 'src/components/Dialog/Dialog';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import { ErrorBoundary } from 'src/components/ErrorBoundary';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { Notice } from 'src/components/Notice/Notice';
import { EntityForTicketDetails } from 'src/components/SupportLink/SupportLink';
import { TextField } from 'src/components/TextField';
import { useAccount } from 'src/queries/account';
import { useAllDatabasesQuery } from 'src/queries/databases';
import { useAllDomainsQuery } from 'src/queries/domains';
import { useAllFirewallsQuery } from 'src/queries/firewalls';
import { useAllKubernetesClustersQuery } from 'src/queries/kubernetes';
import { useAllLinodesQuery } from 'src/queries/linodes/linodes';
import { useAllNodeBalancersQuery } from 'src/queries/nodebalancers';
import { useAllVolumesQuery } from 'src/queries/volumes';
import {
  getAPIErrorOrDefault,
  getErrorMap,
  getErrorStringOrDefault,
} from 'src/utilities/errorUtils';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import { storage } from 'src/utilities/storage';
import { debounce } from 'throttle-debounce';
import AttachFileForm from '../AttachFileForm';
import { AttachmentError } from '../SupportTicketDetail/SupportTicketDetail';
import Reference from '../SupportTicketDetail/TabbedReply/MarkdownReference';
import TabbedReply from '../SupportTicketDetail/TabbedReply/TabbedReply';
import { FileAttachment } from '../index';
import SupportTicketSMTPFields, {
  fieldNameToLabelMap,
  smtpDialogTitle,
  smtpHelperText,
} from './SupportTicketSMTPFields';

const useStyles = makeStyles((theme: Theme) => ({
  expPanelSummary: {
    backgroundColor: theme.name === 'dark' ? theme.bg.main : theme.bg.white,
    paddingTop: theme.spacing(1),
    borderTop: `1px solid ${theme.bg.main}`,
  },
  innerReply: {
    padding: 0,
    '& div[role="tablist"]': {
      marginTop: theme.spacing(),
      marginBottom: theme.spacing(),
    },
  },
  rootReply: {
    marginBottom: theme.spacing(2),
    padding: 0,
  },
}));

interface Accumulator {
  success: string[];
  errors: AttachmentError[];
}

interface AttachmentWithTarget {
  file: FormData;
  ticketId: number;
}

export type EntityType =
  | 'linode_id'
  | 'volume_id'
  | 'domain_id'
  | 'nodebalancer_id'
  | 'lkecluster_id'
  | 'database_id'
  | 'firewall_id'
  | 'none'
  | 'general';

export type TicketType = 'smtp' | 'general';

interface TicketTypeData {
  dialogTitle: string;
  helperText: string | JSX.Element;
}

export interface SupportTicketDialogProps {
  open: boolean;
  prefilledTitle?: string;
  prefilledDescription?: string;
  prefilledEntity?: EntityForTicketDetails;
  prefilledTicketType?: TicketType;
  onClose: () => void;
  onSuccess: (ticketId: number, attachmentErrors?: AttachmentError[]) => void;
  keepOpenOnSuccess?: boolean;
  hideProductSelection?: boolean;
  children?: React.ReactNode;
}

const ticketTypeMap: Record<TicketType, TicketTypeData> = {
  smtp: {
    dialogTitle: smtpDialogTitle,
    helperText: smtpHelperText,
  },
  general: {
    dialogTitle: 'Open a Support Ticket',
    helperText: (
      <>
        {`We love our customers, and we\u{2019}re here to help if you need us.
        Please keep in mind that not all topics are within the scope of our support.
        For overall system status, please see `}
        <a
          href="https://status.linode.com"
          target="_blank"
          aria-describedby="external-site"
          rel="noopener noreferrer"
        >
          status.linode.com
        </a>
        .
      </>
    ),
  },
};

const entityMap: Record<string, EntityType> = {
  Linodes: 'linode_id',
  Volumes: 'volume_id',
  Domains: 'domain_id',
  NodeBalancers: 'nodebalancer_id',
  Kubernetes: 'lkecluster_id',
  Databases: 'database_id',
  Firewalls: 'firewall_id',
};

const entityIdToNameMap: Record<EntityType, string> = {
  linode_id: 'Linode',
  volume_id: 'Volume',
  domain_id: 'Domain',
  nodebalancer_id: 'NodeBalancer',
  lkecluster_id: 'Kubernetes Cluster',
  database_id: 'Database Cluster',
  firewall_id: 'Firewall',
  none: '',
  general: '',
};

export const entitiesToItems = (type: string, entities: any) => {
  return entities.map((entity: any) => {
    return type === 'domain_id'
      ? // Domains don't have labels
        { value: entity.id, label: entity.domain }
      : { value: entity.id, label: entity.label };
  });
};

export const getInitialValue = (
  fromProps?: string,
  fromStorage?: string
): string => {
  return fromProps ?? fromStorage ?? '';
};

export const SupportTicketDialog = (props: SupportTicketDialogProps) => {
  const {
    open,
    prefilledDescription,
    prefilledTitle,
    prefilledEntity,
    prefilledTicketType,
  } = props;

  const { data: account } = useAccount();

  const valuesFromStorage = storage.supportText.get();

  // Ticket information
  const [summary, setSummary] = React.useState<string>(
    getInitialValue(prefilledTitle, valuesFromStorage.title)
  );
  const [description, setDescription] = React.useState<string>(
    getInitialValue(prefilledDescription, valuesFromStorage.description)
  );
  const [entityType, setEntityType] = React.useState<EntityType>(
    prefilledEntity?.type ?? 'general'
  );
  const [entityID, setEntityID] = React.useState<string>(
    prefilledEntity ? String(prefilledEntity.id) : ''
  );
  const [ticketType, setTicketType] = React.useState<TicketType>(
    prefilledTicketType ?? 'general'
  );

  // SMTP ticket information
  const [smtpFields, setSMTPFields] = React.useState({
    customerName: account ? `${account?.first_name} ${account?.last_name}` : '',
    companyName: '',
    useCase: '',
    emailDomains: '',
    publicInfo: '',
  });

  const [files, setFiles] = React.useState<FileAttachment[]>([]);

  const [errors, setErrors] = React.useState<APIError[] | undefined>();
  const [submitting, setSubmitting] = React.useState<boolean>(false);

  const classes = useStyles();

  React.useEffect(() => {
    if (!open) {
      resetDrawer();
    }
  }, [open]);

  // React Query entities
  const {
    data: databases,
    isLoading: databasesLoading,
    error: databasesError,
  } = useAllDatabasesQuery(entityType === 'database_id');

  const {
    data: firewalls,
    isLoading: firewallsLoading,
    error: firewallsError,
  } = useAllFirewallsQuery(entityType === 'firewall_id');

  const {
    data: domains,
    isLoading: domainsLoading,
    error: domainsError,
  } = useAllDomainsQuery(entityType === 'domain_id');
  const {
    data: nodebalancers,
    isLoading: nodebalancersLoading,
    error: nodebalancersError,
  } = useAllNodeBalancersQuery(entityType === 'nodebalancer_id');

  const {
    data: clusters,
    isLoading: clustersLoading,
    error: clustersError,
  } = useAllKubernetesClustersQuery(entityType === 'lkecluster_id');

  const {
    data: linodes,
    isLoading: linodesLoading,
    error: linodesError,
  } = useAllLinodesQuery({}, {}, entityType === 'linode_id');

  const {
    data: volumes,
    isLoading: volumesLoading,
    error: volumesError,
  } = useAllVolumesQuery({}, {}, entityType === 'volume_id');

  const saveText = (_title: string, _description: string) => {
    storage.supportText.set({ title: _title, description: _description });
  };

  // Has to be a ref or else the timeout is redone with each render
  const debouncedSave = React.useRef(debounce(500, false, saveText)).current;

  React.useEffect(() => {
    // Store in-progress work to localStorage
    debouncedSave(summary, description);
  }, [summary, description]);

  const resetTicket = (clearValues: boolean = false) => {
    /**
     * Clear the drawer completely if clearValues is passed (as in when closing the drawer)
     * or reset to the default values (from props or localStorage) otherwise.
     */
    const _summary = clearValues
      ? ''
      : getInitialValue(prefilledTitle, valuesFromStorage.title);
    const _description = clearValues
      ? ''
      : getInitialValue(prefilledDescription, valuesFromStorage.description);
    setSummary(_summary);
    setDescription(_description);
    setEntityID('');
    setEntityType('general');
    setTicketType('general');
  };

  const resetDrawer = (clearValues: boolean = false) => {
    resetTicket(clearValues);
    setFiles([]);

    if (clearValues) {
      saveText('', '');
    }
  };

  const handleSummaryInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSummary(e.target.value);
  };

  const handleDescriptionInputChange = (value: string) => {
    setDescription(value);
    // setErrors?
  };

  const handleEntityTypeChange = (e: Item<string>) => {
    // Don't reset things if the type hasn't changed
    if (entityType === e.value) {
      return;
    }
    setEntityType(e.value as EntityType);
    setEntityID('');
  };

  const handleEntityIDChange = (selected: Item | null) => {
    setEntityID(String(selected?.value) ?? '');
  };

  const handleSMTPFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSMTPFields((smtpFields) => ({ ...smtpFields, [name]: value }));
  };

  /**
   * When variant ticketTypes include additional fields, fields must concat to one description string.
   * For readability, replace field names with field labels and format the description in Markdown.
   */
  const formatDescription = (fields: Record<string, string>) => {
    return Object.entries(fields)
      .map(
        ([key, value]) =>
          `**${fieldNameToLabelMap[key]}**\n${value ? value : 'No response'}`
      )
      .join('\n\n');
  };

  const close = () => {
    props.onClose();
    if (ticketType === 'smtp') {
      window.setTimeout(() => resetDrawer(true), 500);
    }
  };

  const onCancel = () => {
    props.onClose();
    window.setTimeout(() => resetDrawer(true), 500);
  };

  const updateFiles = (newFiles: FileAttachment[]) => {
    setFiles(newFiles);
  };

  /* Reducer passed into Bluebird.reduce() below.
   * Unfortunately, this reducer has side effects. Uploads each file and accumulates a list of
   * any upload errors. Also tracks loading state of each individual file. */
  const attachFileReducer = (
    accumulator: Accumulator,
    attachment: AttachmentWithTarget,
    idx: number
  ) => {
    return uploadAttachment(attachment.ticketId, attachment.file)
      .then(() => {
        /* null out an uploaded file after upload */
        setFiles((oldFiles: FileAttachment[]) =>
          update(
            idx,
            { file: null, uploading: false, uploaded: true, name: '' },
            oldFiles
          )
        );
        return accumulator;
      })
      .catch((attachmentErrors) => {
        /*
         * Note! We want the first few uploads to succeed even if the last few
         * fail! Don't try to aggregate errors!
         */
        setFiles((oldFiles) =>
          update(idx, { ...oldFiles[idx], uploading: false }, oldFiles)
        );
        const newError = getErrorStringOrDefault(
          attachmentErrors,
          'There was an error attaching this file. Please try again.'
        );
        return {
          ...accumulator,
          errors: [
            ...accumulator.errors,
            { error: newError, file: attachment.file.get('name') },
          ],
        };
      });
  };

  /* Called after the ticket is successfully completed. */
  const attachFiles = (ticketId: number) => {
    const filesWithTarget: AttachmentWithTarget[] = files
      .filter((file) => !file.uploaded)
      .map((file, idx) => {
        setFiles((oldFiles) =>
          update(idx, { ...oldFiles[idx], uploading: true }, oldFiles)
        );
        const formData = new FormData();
        formData.append('file', file.file ?? ''); // Safety check for TS only
        formData.append('name', file.name);
        return { file: formData, ticketId };
      });

    /* Upload each file as an attachment, and return a Promise that will resolve to
     *  an array of aggregated errors that may have occurred for individual uploads. */
    return Bluebird.reduce(filesWithTarget, attachFileReducer, {
      success: [],
      errors: [],
    });
  };

  const onSubmit = () => {
    const { onSuccess } = props;
    const _description =
      ticketType === 'smtp' ? formatDescription(smtpFields) : description;
    if (!['none', 'general'].includes(entityType) && !entityID) {
      setErrors([
        {
          field: 'input',
          reason: `Please select a ${entityIdToNameMap[entityType]}.`,
        },
      ]);
      return;
    }
    setErrors(undefined);
    setSubmitting(true);

    createSupportTicket({
      description: _description,
      summary,
      [entityType]: Number(entityID),
    })
      .then((response) => {
        setErrors(undefined);
        setSubmitting(false);
        window.setTimeout(() => resetDrawer(true), 500);
        return response;
      })
      .then((response) => {
        attachFiles(response!.id).then(({ errors: _errors }: Accumulator) => {
          if (!props.keepOpenOnSuccess) {
            close();
          }
          /* Errors will be an array of errors, or empty if all attachments succeeded. */
          onSuccess(response!.id, _errors);
        });
      })
      .catch((errResponse) => {
        /* This block will only handle errors in creating the actual ticket; attachment
         * errors are handled above. */
        setErrors(getAPIErrorOrDefault(errResponse));
        setSubmitting(false);
        scrollErrorIntoView();
      });
  };

  const renderEntityTypes = () => {
    return Object.keys(entityMap).map((key: string) => {
      return { label: key, value: entityMap[key] };
    });
  };

  const smtpRequirementsMet =
    smtpFields.customerName.length > 0 &&
    smtpFields.useCase.length > 0 &&
    smtpFields.emailDomains.length > 0 &&
    smtpFields.publicInfo.length > 0;
  const requirementsMet =
    summary.length > 0 &&
    (ticketType === 'smtp' ? smtpRequirementsMet : description.length > 0);

  const hasErrorFor = getErrorMap(['summary', 'description', 'input'], errors);
  const summaryError = hasErrorFor.summary;
  const descriptionError = hasErrorFor.description;
  const generalError = hasErrorFor.none;
  const inputError = hasErrorFor.input;

  const topicOptions = [
    { label: 'General/Account/Billing', value: 'general' },
    ...renderEntityTypes(),
  ];

  const selectedTopic = topicOptions.find((eachTopic) => {
    return eachTopic.value === entityType;
  });

  const getEntityOptions = (): Item<any, string>[] => {
    const reactQueryEntityDataMap = {
      database_id: databases,
      firewall_id: firewalls,
      domain_id: domains,
      volume_id: volumes,
      lkecluster_id: clusters,
      nodebalancer_id: nodebalancers,
      linode_id: linodes,
    };

    if (!reactQueryEntityDataMap[entityType]) {
      return [];
    }

    // domain's don't have a label so we map the domain as the label
    if (entityType === 'domain_id') {
      return (
        reactQueryEntityDataMap[entityType]?.map(({ id, domain }) => ({
          value: id,
          label: domain,
        })) || []
      );
    }

    return (
      reactQueryEntityDataMap[entityType]?.map(
        ({ id, label }: { id: number; label: string }) => ({
          value: id,
          label,
        })
      ) || []
    );
  };

  const loadingMap: Record<EntityType, boolean> = {
    database_id: databasesLoading,
    firewall_id: firewallsLoading,
    domain_id: domainsLoading,
    volume_id: volumesLoading,
    lkecluster_id: clustersLoading,
    nodebalancer_id: nodebalancersLoading,
    linode_id: linodesLoading,
    none: false,
    general: false,
  };

  const errorMap: Record<EntityType, APIError[] | null> = {
    database_id: databasesError,
    firewall_id: firewallsError,
    domain_id: domainsError,
    volume_id: volumesError,
    lkecluster_id: clustersError,
    nodebalancer_id: nodebalancersError,
    linode_id: linodesError,
    none: null,
    general: null,
  };

  const entityOptions = getEntityOptions();
  const areEntitiesLoading = loadingMap[entityType];
  const entityError = Boolean(errorMap[entityType])
    ? `Error loading ${entityIdToNameMap[entityType]}s`
    : undefined;

  const selectedEntity =
    entityOptions.find((thisEntity) => String(thisEntity.value) === entityID) ||
    null;

  return (
    <ErrorBoundary fallback={<ErrorState errorText="" />}>
      <Dialog
        open={open}
        onClose={close}
        fullHeight
        fullWidth
        title={ticketTypeMap[ticketType].dialogTitle}
      >
        {props.children || (
          <React.Fragment>
            {generalError && (
              <Notice error text={generalError} data-qa-notice />
            )}

            <Typography data-qa-support-ticket-helper-text>
              {ticketTypeMap[ticketType].helperText}
            </Typography>
            <TextField
              label="Title"
              placeholder="Enter a title for your ticket."
              required
              value={summary}
              onChange={handleSummaryInputChange}
              inputProps={{ maxLength: 64 }}
              errorText={summaryError}
              data-qa-ticket-summary
            />
            {ticketType === 'smtp' ? (
              <SupportTicketSMTPFields
                handleChange={handleSMTPFieldChange}
                formState={smtpFields}
              />
            ) : (
              <React.Fragment>
                {props.hideProductSelection ? null : (
                  <React.Fragment>
                    <Select
                      options={topicOptions}
                      label="What is this regarding?"
                      value={selectedTopic}
                      onChange={handleEntityTypeChange}
                      data-qa-ticket-entity-type
                      isClearable={false}
                    />
                    {!['none', 'general'].includes(entityType) && (
                      <>
                        <Select
                          options={entityOptions}
                          value={selectedEntity}
                          disabled={entityOptions.length === 0}
                          errorText={entityError || inputError}
                          placeholder={`Select a ${entityIdToNameMap[entityType]}`}
                          label={
                            entityIdToNameMap[entityType] ?? 'Entity Select'
                          }
                          onChange={handleEntityIDChange}
                          data-qa-ticket-entity-id
                          isLoading={areEntitiesLoading}
                          isClearable={false}
                        />
                        {!areEntitiesLoading && entityOptions.length === 0 ? (
                          <FormHelperText>
                            You don&rsquo;t have any{' '}
                            {entityIdToNameMap[entityType]}s on your account.
                          </FormHelperText>
                        ) : null}
                      </>
                    )}
                  </React.Fragment>
                )}
                <TabbedReply
                  required
                  error={descriptionError}
                  handleChange={handleDescriptionInputChange}
                  value={description}
                  innerClass={classes.innerReply}
                  rootClass={classes.rootReply}
                  placeholder={
                    "Tell us more about the trouble you're having and any steps you've already taken to resolve it."
                  }
                />
                <Accordion
                  heading="Formatting Tips"
                  detailProps={{ className: classes.expPanelSummary }}
                >
                  <Reference />
                </Accordion>
                <AttachFileForm files={files} updateFiles={updateFiles} />
              </React.Fragment>
            )}
            <StyledActionPanel>
              <Button
                buttonType="secondary"
                onClick={onCancel}
                data-qa-cancel
                data-testid="cancel"
              >
                Cancel
              </Button>
              <Button
                buttonType="primary"
                disabled={!requirementsMet}
                loading={submitting}
                onClick={onSubmit}
                data-qa-submit
                data-testid="submit"
              >
                Open Ticket
              </Button>
            </StyledActionPanel>
          </React.Fragment>
        )}
      </Dialog>
    </ErrorBoundary>
  );
};
