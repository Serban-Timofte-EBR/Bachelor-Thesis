import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#e91e63',
    },
    secondary: {
      main: '#607d8b', 
    },
    error: {
      main: '#d32f2f', 
    },
    background: {
      default: '#f5f5f5',
    }
  },
  typography: {
    fontFamily: [
      'Arial',
      'Helvetica',
      'sans-serif'
    ].join(','),
  }
});

export default theme;
