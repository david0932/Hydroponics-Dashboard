import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Button } from '../button';

describe('Button', () => {
  it('renders a button with the correct text', () => {
    render(<Button>Click me</Button>);
    const buttonElement = screen.getByRole('button', { name: /click me/i });
    expect(buttonElement).toBeInTheDocument();
  });

  it('applies the correct class names', () => {
    render(<Button className="custom-class">Click me</Button>);
    const buttonElement = screen.getByRole('button', { name: /click me/i });
    expect(buttonElement).toHaveClass('custom-class');
  });

  it('renders a disabled button', () => {
      render(<Button disabled>Disabled</Button>);
      const buttonElement = screen.getByRole('button', { name: /disabled/i });
      expect(buttonElement).toBeDisabled();
  });
});