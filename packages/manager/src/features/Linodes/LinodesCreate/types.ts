import { Image } from '@linode/api-v4/lib/images';
import {
  CreateLinodeRequest,
  Linode,
  LinodeTypeClass,
} from '@linode/api-v4/lib/linodes';
import { Region } from '@linode/api-v4/lib/regions';
import { StackScript, UserDefinedField } from '@linode/api-v4/lib/stackscripts';
import { APIError } from '@linode/api-v4/lib/types';
import { Tag } from 'src/components/TagsInput/TagsInput';
import { ExtendedType } from 'src/utilities/extendType';

export interface ExtendedLinode extends Linode {
  heading: string;
  subHeadings: string[];
}

export type TypeInfo =
  | {
      title: string;
      details: string;
      monthly: number;
      hourly: number;
      backupsMonthly: number | null;
    }
  | undefined;

export type Info = { title?: string; details?: string } | undefined;

/**
 * These props are meant purely for what is displayed in the
 * Checkout bar
 */
export interface WithDisplayData {
  typeDisplayInfo?: TypeInfo;
  regionDisplayInfo?: Info;
  imageDisplayInfo?: Info;
  backupsMonthlyPrice?: number | null;
}

/**
 * Pure Data without the loading and error
 * keys. Component with these props have already been
 * safe-guarded with null, loading, and error checking
 */
export interface WithTypesRegionsAndImages {
  regionsData: Region[];
  typesData?: ExtendedType[];
  imagesData: Record<string, Image>;
}

export interface WithLinodesTypesRegionsAndImages
  extends WithTypesRegionsAndImages {
  linodesData: Linode[];
}

export interface ReduxStateProps {
  userCannotCreateLinode: boolean;
  accountBackupsEnabled: boolean;
}

export type HandleSubmit = (
  payload: CreateLinodeRequest,
  linodeID?: number
) => void;

export type LinodeCreateValidation = (payload: CreateLinodeRequest) => void;

export interface BasicFromContentProps {
  errors?: APIError[];
  selectedImageID?: string;
  updateImageID: (id: string) => void;
  selectedRegionID?: string;
  disabledClasses?: LinodeTypeClass[];
  regionHelperText?: string;
  updateRegionID: (id: string) => void;
  selectedTypeID?: string;
  updateTypeID: (id: string) => void;
}

/**
 * minimum number of state and handlers needed for
 * the _create from image_ flow to function
 */
export interface BaseFormStateAndHandlers {
  errors?: APIError[];
  formIsSubmitting: boolean;
  handleSubmitForm: HandleSubmit;
  selectedImageID?: string;
  updateImageID: (id: string) => void;
  selectedRegionID?: string;
  disabledClasses?: LinodeTypeClass[];
  regionHelperText?: string;
  updateRegionID: (id: string) => void;
  selectedTypeID?: string;
  updateTypeID: (id: string) => void;
  label: string;
  updateLabel: (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  password: string;
  updatePassword: (password: string) => void;
  backupsEnabled: boolean;
  toggleBackupsEnabled: () => void;
  privateIPEnabled: boolean;
  togglePrivateIPEnabled: () => void;
  tags?: Tag[];
  updateTags: (tags: Tag[]) => void;
  resetCreationState: () => void;
  authorized_users: string[];
  setAuthorizedUsers: (usernames: string[]) => void;
  selectedVlanIDs: number[];
  setVlanID: (ids: number[]) => void;
}

/**
 * additional form fields needed when creating a Linode from a Linode
 * AKA cloning a Linode
 */
export interface CloneFormStateHandlers extends BasicFromContentProps {
  selectedDiskSize?: number;
  updateDiskSize: (id: number) => void;
  selectedLinodeID?: number;
  updateLinodeID: (id: number, diskSize?: number) => void;
  updateTypeID: (id: string | null) => void;
}

/**
 * additional form fields needed when creating a Linode from a StackScript
 */
export interface StackScriptFormStateHandlers extends BasicFromContentProps {
  selectedStackScriptID?: number;
  selectedStackScriptUsername?: string;
  selectedStackScriptLabel?: string;
  availableUserDefinedFields?: UserDefinedField[];
  availableStackScriptImages?: Image[];
  updateStackScript: (
    id: number,
    label: string,
    username: string,
    userDefinedFields: UserDefinedField[],
    availableImages: Image[],
    defaultData?: any
  ) => void;
  selectedUDFs?: any;
  handleSelectUDFs: (stackScripts: any) => void;
}

/**
 * additional form fields needed when create a Linode from a backup
 * Note that it extends the _Clone_ props because creating from a backup
 * requires the Linodes data
 */
export interface BackupFormStateHandlers extends CloneFormStateHandlers {
  selectedBackupID?: number;
  setBackupID: (id: number) => void;
}

export interface AppsData {
  appInstances?: StackScript[];
  appInstancesLoading: boolean;
  appInstancesError?: string;
}

export type AllFormStateAndHandlers = BaseFormStateAndHandlers &
  CloneFormStateHandlers &
  StackScriptFormStateHandlers &
  BackupFormStateHandlers;
