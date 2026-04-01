import { Typography, TextField, Button, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { COLORS, terminalInputStyle, mechanicalButtonStyle } from '../../theme/AppTheme';
import type { Member } from '../../interfaces/Member';
import { Fragment, useEffect, useRef, useState } from 'react';
import type { Message } from '../../interfaces/Message';
import type { Recommendation } from '../../interfaces/Recommendation';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { movietequeApi } from '../../api/MovietequeApi';
import { io, Socket } from 'socket.io-client';
import type { RecommendationComplete } from '../../interfaces/RecommendationComplete';
import type { User } from '../../interfaces/User';
import { isSameDay, getDateDividerLabel, formatTime } from '../../utils/DateUtils';

interface RecommendationChatProps {
  currentMember: Member | undefined;
  recommendation: RecommendationComplete | undefined;
}

export function RecommendationChat({ recommendation, currentMember }: RecommendationChatProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);


  useEffect(() => {
    const token = localStorage.getItem('movieteque-token') || '';
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3030/api'
    const socketUrl = apiUrl.replace('/api', ''); // Asumiendo que el socket está en la raíz del mismo dominio

    const socket = io(socketUrl, {
      auth: {
        token: token
      }
    })

    socketRef.current = socket;


    socket.on('connection-ready', () => {
      console.log('Conexión establecida, uniendo a la sala:', recommendation?.id);
      socket.emit('join-room', recommendation?.id);
    })


    socket.on('message-from-server', (nuevoMensaje) => {
      queryClient.setQueryData(
        ['recommendation-messages', recommendation?.id],
        (mensajesViejos: Message[] | undefined) => {
          if (!mensajesViejos) return [nuevoMensaje];
          return [...mensajesViejos, nuevoMensaje];
        }
      );
    });

    socket.on('connect_error', (err) => {
      console.error('Error de conexión:', err.message);
    });
    return () => {
      socket.emit('leave-room', recommendation?.id);
      socket.disconnect();
    };
  }, [recommendation, queryClient]);



  const { data: messagesFromDB, isLoading } = useQuery({
    queryKey: ['recommendation-messages', recommendation?.id],
    queryFn: async () => (await movietequeApi.get<Message[]>(`/recommendation/${recommendation?.group.id}/${recommendation?.id}/messages`)).data,
  })


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }


  useEffect(() => {
    scrollToBottom();
  }, [messagesFromDB]);


  const handleSendMessage = () => {
    if (!inputMessage.trim() || !socketRef.current) return;

    socketRef.current.emit('message-from-client', {
      recommendationId: recommendation?.id,
      message: inputMessage
    });

    setInputMessage('');
  };


  const getSenderInfo = (messageUser: User) => {
    const member = recommendation?.group.members.find(m => m.user.id === messageUser.id);
    return {
      name: member?.nickname || messageUser.username,
      imgUrl: messageUser.imgUrl || 'https://via.placeholder.com/40/0B2833/CBD3D6?text=?'
    };
  };
  if (!recommendation) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        border: `2px solid ${COLORS.primaryMid}`,
        backgroundColor: COLORS.primaryDark,
        position: 'relative',
      }}
    >
      {/* HEADER DEL CHAT */}
      <Box sx={{ p: 2, borderBottom: `2px solid ${COLORS.primaryMid}`, backgroundColor: 'rgba(0,0,0,0.2)' }}>
        <Typography sx={{ fontFamily: 'sans-serif', fontWeight: 900, fontSize: '1.2rem', color: COLORS.primaryLight, letterSpacing: '-1px', textTransform: 'uppercase' }}>
          {t('chat.title', '> TERMINAL DE COMUNICACIÓN')}
        </Typography>
        <Typography sx={{ fontFamily: 'monospace', color: '#55ff55', fontSize: '0.8rem' }}>
          [ {recommendation.movie.name} ]
        </Typography>
      </Box>

      {/* ÁREA DE MENSAJES (SCROLL) */}
      <Box
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3 },
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          overflowY: 'auto',
          '&::-webkit-scrollbar': { width: '6px' },
          '&::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
          '&::-webkit-scrollbar-thumb': { backgroundColor: COLORS.primaryMid, borderRadius: 0 },
        }}
      >
        {isLoading && (
          <Typography sx={{ fontFamily: 'monospace', color: COLORS.primaryMid, textAlign: 'center', mt: 4 }}>
            {t('chat.loading', '>>> CARGANDO_HISTORIAL_')}
          </Typography>
        )}

        {messagesFromDB?.map((msg, index, array) => {
          const isMine = msg.user.id === currentMember?.user.id;
          const senderInfo = getSenderInfo(msg.user);

          // Calculamos si debemos mostrar el divisor
          const showDateDivider = index === 0 || !isSameDay(msg.createdAt, array[index - 1].createdAt);

          return (
            <Fragment key={msg.id}>

              {/* DIVISOR DE FECHA BRUTALISTA */}
              {showDateDivider && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2, width: '100%' }}>
                  <Box sx={{
                    backgroundColor: COLORS.primaryMid,
                    border: `1px solid ${COLORS.primaryLight}`,
                    boxShadow: `2px 2px 0px ${COLORS.accentDark}`,
                    px: 2,
                    py: 0.5
                  }}>
                    <Typography sx={{ fontFamily: 'monospace', color: COLORS.primaryDark, fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase' }}>
                      {getDateDividerLabel(msg.createdAt, t)}
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* MENSAJE */}
              <Box
                sx={{
                  display: 'flex',
                  // Si es mío, se invierte la fila (avatar a la derecha, texto a la izquierda)
                  flexDirection: isMine ? 'row-reverse' : 'row',
                  gap: 2,
                  alignSelf: isMine ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                }}
              >
                {/* Avatar Cuadrado Brutalista */}
                <Box
                  component="img"
                  src={senderInfo.imgUrl}
                  alt={senderInfo.name}
                  sx={{
                    width: 40,
                    height: 40,
                    flexShrink: 0,
                    border: `2px solid ${isMine ? COLORS.primaryLight : COLORS.primaryMid}`,
                    objectFit: 'cover',
                    boxShadow: `2px 2px 0px ${COLORS.accentDark}`
                  }}
                />

                {/* Contenedor del Mensaje */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start' }}>

                  {/* Metadatos (Nombre y Hora) */}
                  <Typography sx={{ fontFamily: 'monospace', color: isMine ? COLORS.primaryLight : COLORS.primaryMid, fontSize: '0.75rem', mb: 0.5, fontWeight: 900, textTransform: 'uppercase' }}>
                    [{senderInfo.name}] _ {formatTime(msg.createdAt)}
                  </Typography>

                  {/* Globo de Texto */}
                  <Box
                    sx={{
                      backgroundColor: isMine ? 'rgba(203, 211, 214, 0.1)' : 'transparent',
                      border: `2px solid ${isMine ? COLORS.primaryLight : COLORS.primaryMid}`,
                      p: 1.5,
                      position: 'relative',
                      // Decoración brutalista opcional: un pequeño borde extra
                      borderRight: isMine ? `6px solid ${COLORS.primaryLight}` : `2px solid ${COLORS.primaryMid}`,
                      borderLeft: !isMine ? `6px solid ${COLORS.primaryMid}` : `2px solid ${COLORS.primaryLight}`,
                    }}
                  >
                    <Typography sx={{ fontFamily: 'sans-serif', color: COLORS.primaryLight, fontSize: '0.95rem', whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>
                      {msg.message}
                    </Typography>
                  </Box>
                </Box>

              </Box>
            </Fragment>
          );
        })}
        {/* Ancla para el auto-scroll */}
        <div ref={messagesEndRef} />
      </Box>

      {/* ÁREA DE INPUT (FIJA ABAJO) */}
      <Box sx={{ p: 2, borderTop: `2px solid ${COLORS.primaryMid}`, backgroundColor: 'rgba(0,0,0,0.2)' }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            placeholder={t('chat.inputPlaceholder', 'Escribe un mensaje..._')}
            variant="outlined"
            size="small"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            sx={terminalInputStyle}
          />
          <Button
            disableRipple
            onClick={handleSendMessage}
            sx={{
              ...mechanicalButtonStyle,
              bgcolor: COLORS.primaryLight,
              color: COLORS.primaryDark,
              boxShadow: `3px 3px 0px ${COLORS.accentDark}`,
              p: '0 24px',
              '&:hover': { filter: 'brightness(1.1)' }
            }}
          >
            {t('chat.send', 'ENVIAR')}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
