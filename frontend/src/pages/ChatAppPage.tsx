import Logout from "@/components/auth/logout"
import { Button } from "@/components/ui/button";
import api from "@/lib/axios";
import { useAuthStore } from "@/stores/useAuthStore"
import { toast } from "sonner";

const ChatAppPage = () => {
    const user = useAuthStore((s) => s.user); //(s) => s.user : chỉ lấy đúng trường user trong store và component chỉ render khi user thay đổi 

    const handleOnclick = async () => {
        try {
            // console.log(user);
            await api.get("/users/test", { withCredentials: true });
            toast.success("OK");
        } catch (error) {
            toast.error("Thất bại");
            console.error(error)

        }
    }

    return (
        <div>
            {user?.username}
            <Logout />
            <Button onClick={handleOnclick}>test</Button>
        </div>
    )
}

export default ChatAppPage
