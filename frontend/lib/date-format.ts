import { format, formatDistance } from "date-fns";
import { ptBR } from "date-fns/locale";

// Função helper para formatar datas em português brasileiro
// Garante que datas do backend (UTC) sejam interpretadas corretamente
export const formatDatePtBr = (
  date: string | Date,
  formatStr = "dd/MM/yyyy",
) => {
  // Se for string, garantir que seja interpretada corretamente
  const parsedDate = typeof date === "string" ? new Date(date) : date;
  return format(parsedDate, formatStr, { locale: ptBR });
};

// Função para formatar data completa em português
export const formatDateLongPtBr = (date: string | Date) => {
  const parsedDate = typeof date === "string" ? new Date(date) : date;
  return format(parsedDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });
};

// Função para tempo relativo em português
export const timeAgoPtBr = (date: string | Date) => {
  const parsedDate = typeof date === "string" ? new Date(date) : date;
  return formatDistance(parsedDate, new Date(), {
    addSuffix: true,
    locale: ptBR,
  });
};

// Função para formatar data no formato brasileiro (DD/MM/AAAA)
export const formatDateBR = (date: string | Date) => {
  return formatDatePtBr(date, "dd/MM/yyyy");
};

// Função para formatar data e hora no formato brasileiro
export const formatDateTimeBR = (date: string | Date) => {
  return formatDatePtBr(date, "dd/MM/yyyy 'às' HH:mm");
};

// Função para formatar apenas a hora
export const formatTimeBR = (date: string | Date) => {
  return formatDatePtBr(date, "HH:mm");
};

// Função para formatar data no padrão do date-fns PPP (usado pelos componentes shadcn/ui)
export const formatDatePPP = (date: string | Date) => {
  const parsedDate = typeof date === "string" ? new Date(date) : date;
  return format(parsedDate, "PPP", { locale: ptBR });
};
