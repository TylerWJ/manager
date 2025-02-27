import * as React from 'react';
import { LandingLoading, DEFAULT_DELAY } from './LandingLoading';
import { render, screen, act } from '@testing-library/react';

jest.useFakeTimers();

const LOADING_ICON = 'circle-progress';

describe('LandingLoading', () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  it('renders the loading indicator by default', () => {
    render(<LandingLoading />);
    expect(screen.getByTestId(LOADING_ICON)).toBeInTheDocument();
  });

  it('renders custom loading indicator when children are provided', () => {
    render(
      <LandingLoading>
        <div data-testid="custom-loading-indicator">Loading...</div>
      </LandingLoading>
    );
    expect(screen.getByTestId('custom-loading-indicator')).toBeInTheDocument();
    expect(screen.queryByTestId(LOADING_ICON)).toBeNull();
  });

  it('does not render the loading indicator when shouldDelay is true', () => {
    render(<LandingLoading shouldDelay />);
    expect(screen.queryByTestId(LOADING_ICON)).toBeNull();
  });

  it('renders the loading indicator after the delay', () => {
    render(<LandingLoading shouldDelay />);
    expect(screen.queryByTestId(LOADING_ICON)).toBeNull();
    act(() => {
      jest.advanceTimersByTime(DEFAULT_DELAY);
    });
    expect(screen.getByTestId(LOADING_ICON)).toBeInTheDocument();
  });

  it('renders the loading indicator after the specified delayInMS', () => {
    render(<LandingLoading delayInMS={2000} />);
    expect(screen.queryByTestId(LOADING_ICON)).toBeNull();
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(screen.getByTestId(LOADING_ICON)).toBeInTheDocument();
  });

  it('does not render the loading indicator when shouldDelay is false and no delayInMS is provided', () => {
    render(<LandingLoading shouldDelay={false} />);
    expect(screen.getByTestId(LOADING_ICON)).toBeInTheDocument();
  });
});
