import api from '@/lib/axios';
import type { ConversationResponse, Message } from '@/types/chat';

interface FetchMessageProps {
    messages: Message[];
    cursor?: string;
}

const pageLimit = 20;

export const chatService = {
    async fetchConversations(): Promise<ConversationResponse> {
        const res = await api.get("/conversations");
        return res.data;
    },

    async fetchMessage(id: string, cursor?: string): Promise<FetchMessageProps> {
        const res = await api.get(`/conversations/${id}/messages?limit=${pageLimit}&cursor=${cursor}`);
        return {
            messages: res.data.messages,
            cursor: res.data.nextCursor
        }
    },

    async sendDirectMessage(
        recipientId: string,
        content: string = "",
        imgUrl?: string,
        conversationId?: string,
        file?: File
    ) {
        const formData = new FormData();
        formData.append('recipientId', recipientId);
        if (content) formData.append('content', content);
        if (conversationId) formData.append('conversationId', conversationId);
        if (file) formData.append('image', file);

        const res = await api.post("/messages/direct", formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return res.data.message;
    },

    async sendGroupMessage(conversationId: string, content: string = "", imgUrl?: string, file?: File) {
        const formData = new FormData();
        formData.append('conversationId', conversationId);
        if (content) formData.append('content', content);
        if (file) formData.append('image', file);

        const res = await api.post("/messages/group", formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return res.data.message;
    },

    async markAsSeen(conversationId: string) {
        const res = await api.patch(`/conversations/${conversationId}/seen`)
        return res.data;
    },

    async createConversation(type: "direct" | "group", name: string, memberIds: string[]) {
        const res = await api.post("/conversations", { type, name, memberIds });
        return res.data.conversation
    },
};



