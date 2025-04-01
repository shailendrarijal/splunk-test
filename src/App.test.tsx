import { render, screen } from '@testing-library/react';
import App from './App';

test('renders heading correctly', () => {
  render(<App />);
  const heading = screen.getByText(/Server Composer/i);
  expect(heading).toBeInTheDocument();
});
