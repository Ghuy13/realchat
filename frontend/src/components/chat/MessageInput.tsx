import { useAuthStore } from "@/stores/useAuthStore"
import type { Conversation } from "@/types/chat";
import React, { useState, useRef } from "react";
import { Button } from "../ui/button";
import { ImagePlus, Send, X } from "lucide-react";
import { Input } from "../ui/input";
import EmojiPicker from "./EmojiPicker";
import { useChatStore } from "@/stores/useChatStore";
import { toast } from "sonner";

const MessageInput = ({ selectedConvo }: { selectedConvo: Conversation }) => {
    const { user } = useAuthStore();
    const { sendDirectMessage, sendGroupMessage } = useChatStore();
    const [value, setValue] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!user) return;

    const handleFileSelect = (file: File) => {
        if (!file.type.startsWith('image/')) {
            toast.error("Chỉ chấp nhận file ảnh");
            return;
        }
        if (file.size > 10 * 1024 * 1024) { // 10MB
            toast.error("File quá lớn, tối đa 10MB");
            return;
        }
        setSelectedFile(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleImageButtonClick = () => {
        fileInputRef.current?.click();
    };

    const removePreview = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };



    const sendMessage = async () => {
        if (!value.trim() && !selectedFile) return;

        const currValue = value;
        const currFile = selectedFile;

        setValue("");
        removePreview();

        setUploading(true);

        try {
            if (selectedConvo.type === "direct") {
                const participants = selectedConvo.participants;
                const otherUser = participants.filter((p) => p._id !== user._id)[0];
                await sendDirectMessage(otherUser._id, currValue, undefined, currFile);
            } else {
                await sendGroupMessage(selectedConvo._id, currValue, undefined, currFile);
            }
        } catch (error) {
            console.error(error);
            toast.error("Gửi tin nhắn thất bại. Bạn hãy thử lại!");
            // Restore state on error
            setValue(currValue);
            if (currFile) {
                setSelectedFile(currFile);
                setPreviewUrl(URL.createObjectURL(currFile));
            }
        } finally {
            setUploading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="flex flex-col gap-2 p-3 min-h-14 bg-background">
            {/* Preview ảnh */}
            {previewUrl && (
                <div className="relative inline-block max-w-32">
                    <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-auto rounded-lg border"
                    />
                    <Button
                        onClick={removePreview}
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full"
                    >
                        <X className="w-3 h-3" />
                    </Button>
                </div>
            )}

            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-primary/10 transition-smooth"
                    onClick={handleImageButtonClick}
                    disabled={uploading}
                >
                    <ImagePlus className="size-4" />
                </Button>

                <div className="flex-1 relative">
                    <Input
                        onKeyPress={handleKeyPress}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder="Soạn tin nhắn . . ."
                        className="pr-20 h-9 bg-white border-border/50 focus:border-primary/50 transition-smooth resize-none"
                        disabled={uploading}
                    />
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileInputChange}
                        className="hidden"
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                        <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            className="size-8 hover:bg-primary/10 transition-smooth"
                        >
                            <div>
                                <EmojiPicker onChange={(emoji: string) => setValue(`${value}${emoji}`)} />
                            </div>
                        </Button>
                    </div>
                </div>

                <Button
                    onClick={sendMessage}
                    className="bg-gradient-chat hover:shadow-glow transition-smooth hover:scale-105"
                    disabled={(!value.trim() && !selectedFile) || uploading}
                >
                    <Send className="size-4 text-white" />
                </Button>
            </div>
        </div>
    )
}

export default MessageInput
