import { render, screen } from '@testing-library/react';
import QueensApp from './QueensApp';

test('renders app', () => {
  render(<QueensApp />);
  const linkElement = screen.getByText(/Problem 8 hetmanów/i);
  expect(linkElement).toBeInTheDocument();
});
