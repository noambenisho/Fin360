import { AppBar, Toolbar, Typography, Button, Container, Box, IconButton, Menu, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function Navbar() {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="fixed" sx={{ 
      width: '100%',
      background: 'linear-gradient(45deg, #14213D 30%, #28447fff 90%)',
      boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)'
    }}>
      <Container maxWidth={false}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              textDecoration: 'none',
              color: 'white',
              fontWeight: 700,
              letterSpacing: '.3rem'
            }}
          >
            Fin360
          </Typography>

          {/* Desktop menu */}
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            <Button color="inherit" component={Link} to="/">Home</Button>
            <Button color="inherit" component={Link} to="/tax">Tax Calculator</Button>
            <Button color="inherit" component={Link} to="/mortgage">Mortgage vs Investments</Button>
            <Button color="inherit" component={Link} to="/investments">Income & Expenses</Button>
            <Button color="inherit" component={Link} to="/profile">Profile</Button>
            <Button color="inherit" component={Link} to="/login">Login</Button>
          </Box>

          {/* Mobile menu */}
          <IconButton
            sx={{ display: { xs: 'flex', md: 'none' } }}
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={handleMenu}
          >
            <MenuIcon />
          </IconButton>
          
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            onClick={handleClose}
          >
            <MenuItem component={Link} to="/">Home</MenuItem>
            <MenuItem component={Link} to="/tax">Tax Calculator</MenuItem>
            <MenuItem component={Link} to="/mortgage">Mortgage vs Investments</MenuItem>
            <MenuItem component={Link} to="/investments">Income & Expenses</MenuItem>
            <MenuItem component={Link} to="/profile">Profile</MenuItem>
            <MenuItem component={Link} to="/login">Login</MenuItem>
          </Menu>
        </Toolbar>
      </Container>
    </AppBar>
  );
}