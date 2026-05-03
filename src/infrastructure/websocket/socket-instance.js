let wsServer = null;

export const setWebSocketServer = (server) => {
    wsServer = server;
};

export const getWebSocketServer = () => {
    return wsServer;
};
