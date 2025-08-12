import { AppBar, Toolbar, Typography, Button, Container } from '@mui/material';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Fin360
          </Typography>
          <Button color="inherit" component={Link} to="/">Home</Button>
          <Button color="inherit" component={Link} to="/tax">Tax Calculator</Button>
          <Button color="inherit" component={Link} to="/mortgage">Mortgage vs Investments</Button>
          <Button color="inherit" component={Link} to="/investments">Income & Expenses</Button>
          <Button color="inherit" component={Link} to="/profile">Profile</Button>
          <Button color="inherit" component={Link} to="/login">Login</Button>
        </Toolbar>
      </Container>
    </AppBar>
  );
}