import classNames from 'classnames';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { Divider } from 'src/components/Divider';
import ListItem from 'src/components/core/ListItem';
import ListItemText from 'src/components/core/ListItemText';
import { Tooltip } from 'src/components/Tooltip';

interface Props extends PrimaryLink {
  closeMenu: () => void;
  dividerClasses?: string;
  linkClasses: (href?: string) => string;
  listItemClasses: string;
  isCollapsed?: boolean;
}

export interface PrimaryLink {
  href?: string;
  onClick?: () => void;
  QAKey: string;
  display: string;
  logo?: React.ComponentType<any>;
  icon?: JSX.Element;
  isDisabled?: () => string;
}

export const NavItem = React.memo((props: Props) => {
  const {
    href,
    onClick,
    QAKey,
    display,
    isCollapsed,
    icon,
    isDisabled,
    linkClasses,
    listItemClasses,
    closeMenu,
  } = props;

  if (!onClick && !href) {
    throw new Error('A Primary Link needs either an href or an onClick prop');
  }

  return (
    /*
     href takes priority here. So if an href and onClick
     are provided, the onClick will not be applied
    */
    <React.Fragment>
      {href ? (
        <Link
          to={href}
          onClick={closeMenu}
          data-qa-nav-item={QAKey}
          className={classNames({
            [linkClasses(href)]: true,
            listItemCollapsed: isCollapsed,
          })}
        >
          {icon && isCollapsed && <div className="icon">{icon}</div>}
          <ListItemText
            primary={display}
            disableTypography={true}
            className={classNames({
              [listItemClasses]: true,
              primaryNavLink: true,
              hiddenWhenCollapsed: isCollapsed,
            })}
          />
        </Link>
      ) : (
        <Tooltip title={isDisabled ? isDisabled() : ''} placement="left-end">
          <ListItem
            onClick={(e) => {
              props.closeMenu();
              /* disregarding undefined is fine here because of the error handling thrown above */
              onClick!();
            }}
            aria-live="polite"
            disabled={!!isDisabled ? !!isDisabled() : false}
            data-qa-nav-item={QAKey}
            className={linkClasses()}
          >
            <ListItemText
              primary={display}
              disableTypography={true}
              className={listItemClasses}
            />
          </ListItem>
        </Tooltip>
      )}
      <Divider className={props.dividerClasses} />
    </React.Fragment>
  );
});
