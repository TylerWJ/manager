import * as React from 'react';
import ActionMenu, { Action } from 'src/components/ActionMenu';
import { useTheme } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';

export interface Handlers {
  handleClickDownload: (objectName: string, newTab: boolean) => void;
  handleClickDelete: (objectName: string) => void;
}

export interface Props extends Handlers {
  objectName: string;
}

export const ObjectActionMenu: React.FC<Props> = (props) => {
  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('md'));

  const { handleClickDownload, handleClickDelete, objectName } = props;

  const actions: Action[] = [
    {
      title: 'Download',
      onClick: () => {
        const shouldOpenInNewTab = true;
        handleClickDownload(objectName, shouldOpenInNewTab);
      },
    },
    {
      title: 'Delete',
      onClick: () => {
        handleClickDelete(objectName);
      },
    },
  ];

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {matchesSmDown ? (
        <ActionMenu
          actionsList={actions}
          ariaLabel={`Action menu for Object ${objectName}`}
        />
      ) : (
        actions.map((action) => {
          return (
            <InlineMenuAction
              key={action.title}
              actionText={action.title}
              onClick={action.onClick}
            />
          );
        })
      )}
    </>
  );
};

export default ObjectActionMenu;
