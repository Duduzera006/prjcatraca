import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Button, Box } from '@mui/material';
import StudentForm from './components/StudentForm';
import StudentList from './components/StudentList';
import AccessLogs from './components/AccessLogs';

const App: React.FC = () => {
  return (
    <Router>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Sistema de Controle de Acesso de Alunos
          </Typography>
          <Button color="inherit" component={Link} to="/">
            Cadastro
          </Button>
          <Button color="inherit" component={Link} to="/alunos">
            Alunos
          </Button>
          <Button color="inherit" component={Link} to="/registros">
            Registros
          </Button>
        </Toolbar>
      </AppBar>

      <Container>
        <Box sx={{ mt: 4 }}>
          <Routes>
            <Route path="/" element={<StudentForm />} />
            <Route path="/alunos" element={<StudentList />} />
            <Route path="/registros" element={<AccessLogs />} />
          </Routes>
        </Box>
      </Container>
    </Router>
  );
};

export default App;
