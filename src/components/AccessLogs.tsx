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
  TextField,
  InputAdornment,
  Alert
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { ref, onValue, query, orderByChild } from 'firebase/database';
import { database } from '../services/firebase';
import { AccessLog } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const AccessLogs: React.FC = () => {
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [searchRA, setSearchRA] = useState('');
  const [recentLogs, setRecentLogs] = useState<AccessLog[]>([]);

  useEffect(() => {
    const logsRef = ref(database, 'registros');
    const logsQuery = query(logsRef, orderByChild('timestamp'));
    
    const unsubscribe = onValue(logsQuery, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const logsList = Object.entries(data).map(([timestamp, value]: [string, any]) => ({
          timestamp,
          ...value
        }));
        const sortedLogs = logsList.reverse();
        setLogs(sortedLogs);
        setRecentLogs(sortedLogs.slice(0, 10)); // Mantém apenas os 10 registros mais recentes
      }
    });

    return () => unsubscribe();
  }, []);

  const formatTimestamp = (timestamp: string) => {
    const [date, time] = timestamp.split('_');
    const formattedDate = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
    const formattedTime = `${time.slice(0, 2)}:${time.slice(2, 4)}:${time.slice(4, 6)}`;
    return format(new Date(`${formattedDate}T${formattedTime}`), "dd 'de' MMMM 'de' yyyy 'às' HH:mm:ss", { locale: ptBR });
  };

  const filteredLogs = logs.filter(log => 
    log.ra && log.ra.toString().toLowerCase().includes(searchRA.toLowerCase())
  );

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, py: 3 }}>
        {/* Seção de Registros em Tempo Real */}
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Últimos Registros de Acesso
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Data/Hora</TableCell>
                  <TableCell>Nome</TableCell>
                  <TableCell>RA</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentLogs.map((log) => (
                  <TableRow key={log.timestamp}>
                    <TableCell>{formatTimestamp(log.timestamp)}</TableCell>
                    <TableCell>{log.nome}</TableCell>
                    <TableCell>{log.ra || 'N/A'}</TableCell>
                    <TableCell>{log.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Seção de Busca Histórica */}
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Buscar Registros de Acesso por Aluno
          </Typography>
          <TextField
            fullWidth
            label="Buscar por RA"
            value={searchRA}
            onChange={(e) => setSearchRA(e.target.value)}
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          
          {searchRA && filteredLogs.length === 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Nenhum registro encontrado para o RA informado.
            </Alert>
          )}
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Data/Hora</TableCell>
                  <TableCell>Nome</TableCell>
                  <TableCell>RA</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.timestamp}>
                    <TableCell>{formatTimestamp(log.timestamp)}</TableCell>
                    <TableCell>{log.nome}</TableCell>
                    <TableCell>{log.ra || 'N/A'}</TableCell>
                    <TableCell>{log.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </Container>
  );
};

export default AccessLogs;