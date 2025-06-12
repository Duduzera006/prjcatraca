import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Paper, 
  Typography,
  Container 
} from '@mui/material';
import { ref, set } from 'firebase/database';
import { database } from '../services/firebase';

const StudentForm: React.FC = () => {
  const [formData, setFormData] = useState({
    nome: '',
    ra: '',
    uid: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await set(ref(database, `autorizados/${formData.uid}`), {
        nome: formData.nome,
        ra: formData.ra,
        autorizado: true
      });
      
      setFormData({ nome: '', ra: '', uid: '' });
      alert('Aluno cadastrado com sucesso!');
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      alert('Erro ao cadastrar aluno');
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        <Typography variant="h5" gutterBottom>
          Cadastro de Novo Aluno
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Nome Completo"
            value={formData.nome}
            onChange={(e) => setFormData({...formData, nome: e.target.value})}
            margin="normal"
            required
          />
          
          <TextField
            fullWidth
            label="RA do Aluno"
            value={formData.ra}
            onChange={(e) => setFormData({...formData, ra: e.target.value})}
            margin="normal"
            required
          />
          
          <TextField
            fullWidth
            label="ID do Cartão"
            value={formData.uid}
            onChange={(e) => setFormData({...formData, uid: e.target.value})}
            margin="normal"
            required
          />
          
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
          >
            Cadastrar Aluno
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default StudentForm; 