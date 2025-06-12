import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Container,
  Switch,
  FormControlLabel,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { ref, onValue, update, remove } from 'firebase/database';
import { database } from '../services/firebase';
import { Student } from '../types';

const StudentList: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [editForm, setEditForm] = useState({
    nome: '',
    ra: '',
    uid: ''
  });

  useEffect(() => {
    const studentsRef = ref(database, 'autorizados');
    
    const unsubscribe = onValue(studentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const studentsList = Object.entries(data).map(([uid, value]: [string, any]) => ({
          uid,
          ...value
        }));
        setStudents(studentsList);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleToggleAuthorization = async (uid: string, currentStatus: boolean) => {
    try {
      await update(ref(database, `autorizados/${uid}`), {
        autorizado: !currentStatus
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status do aluno');
    }
  };

  const handleEditClick = (student: Student) => {
    setSelectedStudent(student);
    setEditForm({
      nome: student.nome,
      ra: student.ra,
      uid: student.uid
    });
    setOpenDialog(true);
  };

  const handleDeleteClick = async (uid: string) => {
    if (window.confirm('Tem certeza que deseja excluir este aluno?')) {
      try {
        await remove(ref(database, `autorizados/${uid}`));
        alert('Aluno excluído com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir aluno:', error);
        alert('Erro ao excluir aluno');
      }
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedStudent(null);
  };

  const handleUpdateStudent = async () => {
    if (!selectedStudent) return;

    try {
      await update(ref(database, `autorizados/${selectedStudent.uid}`), {
        nome: editForm.nome,
        ra: editForm.ra,
        autorizado: selectedStudent.autorizado
      });
      handleDialogClose();
      alert('Aluno atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar aluno:', error);
      alert('Erro ao atualizar aluno');
    }
  };

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        <Typography variant="h5" gutterBottom>
          Lista de Alunos Cadastrados
        </Typography>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>RA</TableCell>
                <TableCell>ID do Cartão</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.uid}>
                  <TableCell>{student.nome}</TableCell>
                  <TableCell>{student.ra}</TableCell>
                  <TableCell>{student.uid}</TableCell>
                  <TableCell>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={student.autorizado}
                          onChange={() => handleToggleAuthorization(student.uid, student.autorizado)}
                        />
                      }
                      label={student.autorizado ? "Autorizado" : "Não Autorizado"}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEditClick(student)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteClick(student.uid)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>Editar Aluno</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Nome Completo"
              value={editForm.nome}
              onChange={(e) => setEditForm({...editForm, nome: e.target.value})}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="RA do Aluno"
              value={editForm.ra}
              onChange={(e) => setEditForm({...editForm, ra: e.target.value})}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="ID do Cartão"
              value={editForm.uid}
              disabled
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancelar</Button>
          <Button onClick={handleUpdateStudent} variant="contained" color="primary">
            Atualizar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StudentList; 