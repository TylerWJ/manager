import { CloneVolumeSchema } from '@linode/validation/lib/volumes.schema';
import { Formik } from 'formik';
import * as React from 'react';
import Form from 'src/components/core/Form';
import { Typography } from 'src/components/Typography';
import { resetEventsPolling } from 'src/eventsPolling';
import { useCloneVolumeMutation } from 'src/queries/volumes';
import { getErrorMap } from 'src/utilities/errorUtils';
import {
  handleFieldErrors,
  handleGeneralErrors,
} from 'src/utilities/formikErrorUtils';
import LabelField from './LabelField';
import NoticePanel from './NoticePanel';
import { PricePanel } from './PricePanel';
import VolumesActionsPanel from './VolumesActionsPanel';

interface Props {
  onClose: () => void;
  volumeId: number;
  volumeLabel: string;
  volumeSize: number;
  volumeRegion: string;
}

const initialValues = { label: '' };

export const CloneVolumeForm = (props: Props) => {
  const { onClose, volumeId, volumeRegion, volumeLabel, volumeSize } = props;

  const { mutateAsync: cloneVolume } = useCloneVolumeMutation();

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={CloneVolumeSchema}
      onSubmit={(values, { setSubmitting, setStatus, setErrors }) => {
        cloneVolume({ volumeId, label: values.label })
          .then((_) => {
            onClose();
            resetEventsPolling();
          })
          .catch((errorResponse) => {
            const defaultMessage = `Unable to clone this volume at this time. Please try again later.`;
            const mapErrorToStatus = () =>
              setStatus({ generalError: getErrorMap([], errorResponse).none });

            setSubmitting(false);
            handleFieldErrors(setErrors, errorResponse);
            handleGeneralErrors(
              mapErrorToStatus,
              errorResponse,
              defaultMessage
            );
          });
      }}
    >
      {({
        errors,
        handleBlur,
        handleChange,
        handleSubmit,
        isSubmitting,
        resetForm,
        status,
        touched,
        values,
      }) => {
        return (
          <Form>
            <Typography variant="body1">
              The newly created volume will be an exact clone of{' '}
              <b>{volumeLabel}</b>. It will have a size of {volumeSize} GB and
              be available in {volumeRegion}.
            </Typography>
            {status && (
              <NoticePanel
                success={status.success}
                error={status.generalError}
              />
            )}
            <LabelField
              error={touched.label ? errors.label : undefined}
              name="label"
              onBlur={handleBlur}
              onChange={handleChange}
              value={values.label}
            />
            <PricePanel value={volumeSize} currentSize={volumeSize} />
            <VolumesActionsPanel
              onSubmit={handleSubmit}
              onCancel={() => {
                resetForm();
                onClose();
              }}
              isSubmitting={isSubmitting}
              submitText="Clone Volume"
            />
          </Form>
        );
      }}
    </Formik>
  );
};
