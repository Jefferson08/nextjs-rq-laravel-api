import axios from "axios";

// Configuração base do axios
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 10000, // 10 segundos de timeout
  withCredentials: true, // Importante para cookies de sessão
});

// Cliente separado para pegar o CSRF token
export const csrfClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Função para garantir que temos o CSRF token
let csrfTokenFetched = false;

const ensureCsrfToken = async () => {
  if (!csrfTokenFetched) {
    try {
      await csrfClient.get("/sanctum/csrf-cookie");
      csrfTokenFetched = true;
      console.log("🔒 CSRF token fetched successfully");
    } catch (error) {
      console.error("❌ Failed to fetch CSRF token:", error);
      throw error;
    }
  }
};

// Função para extrair CSRF token do cookie
const getCSRFToken = () => {
  if (typeof document !== "undefined") {
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split("=");
      if (name === "XSRF-TOKEN") {
        return decodeURIComponent(value);
      }
    }
  }
  return null;
};

// Interceptor para requests
apiClient.interceptors.request.use(
  async (config) => {
    // Buscar CSRF token para métodos que modificam dados
    if (
      config.method &&
      ["post", "put", "patch", "delete"].includes(config.method.toLowerCase())
    ) {
      await ensureCsrfToken();

      // Adicionar CSRF token no header
      const csrfToken = getCSRFToken();
      if (csrfToken) {
        config.headers["X-XSRF-TOKEN"] = csrfToken;
      }
    }

    console.log(
      `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`,
    );
    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  },
);

// Interceptor para responses
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    // Tratamento de erros específicos
    if (error.response) {
      // O servidor respondeu com um status de erro
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Não autenticado - comportamento esperado para algumas rotas
          console.log("🔒 Unauthorized - User not authenticated");
          break;
        case 403:
          console.error("Forbidden - Access denied");
          break;
        case 404:
          console.error("Not found");
          break;
        case 422:
          // Erros de validação do Laravel
          console.error("Validation errors:", data.errors);
          break;
        case 500:
          console.error("Internal server error");
          break;
        default:
          console.error(`HTTP ${status}:`, data.message || "Unknown error");
      }

      // Rejeitar com uma mensagem mais amigável
      return Promise.reject({
        status,
        message: data.message || "An error occurred",
        errors: data.errors || null,
      });
    } else if (error.request) {
      // A requisição foi feita mas não houve resposta
      console.error("Network error - no response received");
      return Promise.reject({
        status: 0,
        message: "Network error - please check your connection",
        errors: null,
      });
    } else {
      // Erro na configuração da requisição
      console.error("Request setup error:", error.message);
      return Promise.reject({
        status: 0,
        message: error.message || "Request configuration error",
        errors: null,
      });
    }
  },
);

export default apiClient;
