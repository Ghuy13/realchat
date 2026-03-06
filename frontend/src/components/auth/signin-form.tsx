import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod' // Giúp kết nối Zod với React Hook form
import { Label } from "../ui/label";
// import { use } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNavigate } from "react-router-dom";

// tạo schema mô tả điều kiện của form đăng ký 
//z.object : mô tả đối tượng có nhiều trường mỗi trường có từng ô input trong form
const signInSchema = z.object({
    username: z.string().min(3, "Tên đăng nhập phải có ít nhất 3 ký tự"),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

type SignInFormvalues = z.infer<typeof signInSchema>;

export function SigninForm({ className, ...props }: React.ComponentProps<"div">) {
    const { signIn } = useAuthStore();
    const navigate = useNavigate(); // chuyển người dùng sang trang đăng nhập nếu đăng ký thành công

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignInFormvalues>({
        resolver: zodResolver(signInSchema),
    });

    const onSubmit = async (data: SignInFormvalues) => {
        const { username, password } = data;
        await signIn(username, password)
        navigate("/");
        // Gọi API từ backend để signIn
    };
    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card className="overflow-hidden p-0 border-border">
                <CardContent className="grid p-0 md:grid-cols-2">
                    <form className="p-4 md:p-6" onSubmit={handleSubmit(onSubmit)}>
                        <div className="flex flex-col gap-6">
                            {/* header - logo */}
                            <div className="flex flex-col items-center text-center gap-2 ">
                                <a href="/" className="mx-auto block w-fit text-center">
                                    <img src="/logo.svg" alt="logo" className="w-16 h-16" />
                                </a>
                                <h1 className="text-2xl font-bold"> Chào mừng quay lại </h1>
                                <p className="text-muted-foreground text-balance">Đăng nhập vào tài khoản RealChat của bạn</p>

                            </div>

                            {/* user name */}
                            <div className="flex flex-col gap-3">
                                <div className="space-y-2">
                                    <Label htmlFor="username" className="block text-sm"> Tên đăng nhập </Label>
                                    <Input
                                        type="text"
                                        id="username"
                                        placeholder="Mời nhập tên đăng nhập"
                                        {...register("username")}
                                    />
                                    {errors.username && (
                                        <p className="text-destructive text-sm"> {errors.username.message} </p>
                                    )}
                                </div>

                                {/* password */}
                                <div className="flex flex-col gap-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="password" className="block text-sm"> Mật khẩu </Label>
                                        <Input
                                            type="password"
                                            id="password"
                                            {...register("password")}
                                        />
                                        {errors.password && (
                                            <p className="text-destructive text-sm"> {errors.password.message} </p>
                                        )}
                                    </div>
                                    {/* nút đăng nhập */}
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={isSubmitting}
                                    >
                                        Đăng nhập
                                    </Button>
                                    <div className="text-center text-sm">
                                        Chưa có tài khoản ? {""}
                                        <a href="/signup" className="underline underline-offset-4">Đăng Ký</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                    <div className="bg-muted relative hidden md:block">
                        <img
                            src="/placeholder.png"
                            alt="Image"
                            className="absolute top-1/2 -translate-y-1/2  object-cover"
                        />
                    </div>
                </CardContent>
            </Card>
            <div className="text-xs text-balance px-6 text-center *:[a]:hover:text-primary text-muted-foreground *:[a]:underline *:[a]:unnderline-offset-5 " >
                Bằng cách tiếp tục bạn đồng ý với <a href="#">Điều khoản dịch vụ</a>{" "}
                và <a href="#">Chính sách bảo mật</a>.
            </div>
        </div>
    )
}