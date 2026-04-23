import React from 'react';
import { render, screen } from '@testing-library/react';

jest.mock('axios', () => ({
  create: () => ({
    get: jest.fn(() => Promise.resolve({ data: [] })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
    patch: jest.fn(() => Promise.resolve({ data: {} }))
  })
}), { virtual: true });

jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => <div>{children}</div>,
  Routes: ({ children }) => {
    const mockReact = require('react');
    return <div>{mockReact.Children.toArray(children)[0]}</div>;
  },
  Route: ({ element }) => element,
  Link: ({ children, to }) => <a href={to}>{children}</a>,
  useNavigate: () => jest.fn()
}), { virtual: true });

import App from './App';

test('renders the loanvia homepage shell', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /Loanvia/i, level: 1 })).toBeInTheDocument();
  expect(screen.getByText(/Why Choose Loanvia/i)).toBeInTheDocument();
});
