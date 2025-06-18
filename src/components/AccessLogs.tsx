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
  Alert,
  Pagination,
  Tabs,
  Tab,
  CircularProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  CheckCircleOutline as CheckIcon, 
  HighlightOff as ErrorIcon,      
  HelpOutline as UnknownIcon      
} from '@mui/icons-material';
import { ref, onValue, query, orderByChild } from 'firebase/database';
import { database } from '../services/firebase';
import { AccessLog } from '../types';
import { Student } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toZonedTime } from 'date-fns-tz';

const AccessLogs: React.FC = () => {
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [searchRA, setSearchRA] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 10;
  const [StudentsMap, setStudentsMap] = useState<{ [uid: string]: Student }>({});
  const [currentTab, setCurrentTab] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const authorizedRef = ref(database, 'autorizados');
    const unsubscribeAuthorized = onValue(authorizedRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const usersMap: { [uid: string]: Student } = {};
        Object.entries(data).forEach(([uid, userData]: [string, any]) => {
          usersMap[uid] = { uid, ...userData };
        });
        setStudentsMap(usersMap);
      } else {
        setStudentsMap({});
      }
      setIsLoading(false); 
    }, (error) => {
      console.error("Erro ao carregar usuários autorizados:", error);
      setIsLoading(false);
    });

    return () => unsubscribeAuthorized();
  }, []); 

  useEffect(() => {
    if (!isLoading) {
      const logsRef = ref(database, 'registros');
      const logsQuery = query(logsRef, orderByChild('timestamp'));

      const unsubscribeLogs = onValue(logsQuery, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const logsList: AccessLog[] = Object.entries(data).map(([timestamp, value]: [string, any]) => {
            const uid = value.uid;
            const StudentData = StudentsMap[uid];
            return {
              timestamp,
              ...value,
              nome: StudentData ? StudentData.nome : 'Desconhecido',
              ra: StudentData ? StudentData.ra : 'N/A'
            };
          });
          const sortedLogs = logsList.reverse();
          setLogs(sortedLogs);
        } else {
            setLogs([]);
        }
      }, (error) => {
        console.error("Erro ao carregar registros:", error);
      });

      return () => unsubscribeLogs();
    }
  }, [isLoading, StudentsMap]);

  const formatTimestamp = (timestamp: string) => {
    const [date, time] = timestamp.split('_');
    const formattedDate = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
    const formattedTime = `${time.slice(0, 2)}:${time.slice(2, 4)}:${time.slice(4, 6)}`;
    const utcDate = new Date(`${formattedDate}T${formattedTime}Z`);
    const zonedDate = toZonedTime(utcDate, 'America/Sao_Paulo');
    return format(new Date(zonedDate), "dd 'de' MMMM 'de' yyyy 'às' HH:mm:ss", { locale: ptBR });
  };

  const renderStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case 'autorizado':
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main' }}>
            <CheckIcon sx={{ mr: 0.5 }} />
          </Box>
        );
      case 'negado':
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', color: 'error.main' }}>
            <ErrorIcon sx={{ mr: 0.5 }} />
          </Box>
        );
      case 'nao_encontrado':
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', color: 'warning.main' }}>
            <UnknownIcon sx={{ mr: 0.5 }} />
          </Box>
        );
      default:
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
            <UnknownIcon sx={{ mr: 0.5 }} />
          </Box>
        );
    }
  };

  let displayedLogs: AccessLog[] = [];
  let totalLogsForPagination = 0;

  if (currentTab === 0) {
    displayedLogs = logs.slice(0, logsPerPage);
    totalLogsForPagination = logsPerPage;
  } else {
    let filteredResults = logs;

    if (searchRA.trim() !== '') {
      filteredResults = logs.filter(log =>
        log.ra && log.ra !== 'N/A' && String(log.ra).toLowerCase().includes(searchRA.toLowerCase())
      );
    }

    totalLogsForPagination = filteredResults.length;

    const indexOfLastLog = currentPage * logsPerPage;
    const indexOfFirstLog = indexOfLastLog - logsPerPage;
    displayedLogs = filteredResults.slice(indexOfFirstLog, indexOfLastLog);
  }

  const totalPages = Math.ceil(totalLogsForPagination / logsPerPage);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
    setCurrentPage(1);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Carregando dados...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, py: 3 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={currentTab} onChange={handleTabChange} aria-label="abas de registros de acesso">
              <Tab label="Últimos Registros" />
              <Tab label="Busca Histórica" />
            </Tabs>
          </Box>

          <TextField
            fullWidth
            label="Buscar por RA"
            value={searchRA}
            onChange={(e) => {
              setSearchRA(e.target.value);
              setCurrentPage(1);
              if (currentTab === 0 && e.target.value !== '') {
                setCurrentTab(1);
              }
            }}
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />

          {currentTab === 1 && searchRA.trim() !== '' && totalLogsForPagination === 0 && (
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
                {displayedLogs.length > 0 ? (
                  displayedLogs.map((log) => (
                    <TableRow key={log.timestamp}>
                      <TableCell>{formatTimestamp(log.timestamp)}</TableCell>
                      <TableCell>{log.nome}</TableCell>
                      <TableCell>{log.ra || 'N/A'}</TableCell>
                      <TableCell>{renderStatus(log.status)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      {currentTab === 0 ? "Nenhum registro recente encontrado." : "Nenhum registro encontrado com os critérios especificados."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {currentTab === 1 && totalLogsForPagination > logsPerPage && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default AccessLogs;