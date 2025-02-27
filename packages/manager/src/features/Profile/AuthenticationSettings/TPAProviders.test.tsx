import React from 'react';
import userEvent from '@testing-library/user-event';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { screen } from '@testing-library/react';
import { TPAProviders } from './TPAProviders';

jest.mock('src/hooks/useFlags', () => ({
  __esModule: true,
  default: jest.fn().mockReturnValue({
    tpaProviders: [
      {
        displayName: 'Google',
        name: 'google',
        href: 'https://google.com',
        icon: 'GoogleIcon',
      },
      {
        displayName: 'GitHub',
        name: 'github',
        href: 'https://github.com',
        icon: 'GitHubIcon',
      },
    ],
  }),
}));

describe('TPAProviders component', () => {
  it('Should render login method with Linode button', () => {
    const authType = 'password';
    renderWithTheme(<TPAProviders authType={authType} />);
    const linodeButton = screen.getByTestId('Button-Cloud Manager');
    const LinodeButtonEnabled = screen.getByTestId('Enabled-Cloud Manager');
    expect(linodeButton).toBeInTheDocument();
    expect(linodeButton).toBeDisabled();
    expect(LinodeButtonEnabled).toBeInTheDocument();
  });
  it('Should render login method with Google button', () => {
    const authType = 'google';
    renderWithTheme(<TPAProviders authType={authType} />);
    const googleButton = screen.getByTestId('Button-Google');
    const googleButtonEnabled = screen.getByTestId('Enabled-Google');
    const noticeElement = screen.getByTestId('Notice-Google');
    expect(googleButton).toBeInTheDocument();
    expect(googleButton).toBeDisabled();
    expect(googleButtonEnabled).toBeInTheDocument();
    expect(noticeElement).toBeInTheDocument();
  });
  it('Should render login method with GitHub button', () => {
    const authType = 'github';
    renderWithTheme(<TPAProviders authType={authType} />);
    const githubButton = screen.getByTestId('Button-GitHub');
    const githubButtonEnabled = screen.getByTestId('Enabled-GitHub');
    const noticeElement = screen.getByTestId('Notice-GitHub');
    expect(githubButton).toBeInTheDocument();
    expect(githubButton).toBeDisabled();
    expect(githubButtonEnabled).toBeInTheDocument();
    expect(noticeElement).toBeInTheDocument();
  });

  test('Should open the dialog when the button is clicked', async () => {
    const authType = 'password';
    const { getByTestId } = renderWithTheme(
      <TPAProviders authType={authType} />
    );
    const button = getByTestId('Button-Google');
    userEvent.click(button);
    const dialog = getByTestId('drawer');
    expect(dialog).toBeInTheDocument();
  });
});
