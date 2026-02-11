import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod' // Giúp kết nối Zod với React Hook form
import { Label } from "../ui/label";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNavigate } from "react-router-dom";

// tạo schema mô tả điều kiện của form đăng ký 
//z.object : mô tả đối tượng có nhiều trường mỗi trường có từng ô input trong form
const signUpSchema = z.object({
  firstname: z.string().min(1, "Họ không được để trống"),
  lastname: z.string().min(1, "Tên không được để trống"),
  username: z.string().min(3, "Tên đăng nhập phải có ít nhất 3 ký tự"),
  email: z.email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

//infer: tự suy ra kiểu
//typeof: lấy kiểu dữ liệu của signUpSchema
// infer<typeof: từ cái schema tự suy ra kiểu của form
type SignUpFormvalues = z.infer<typeof signUpSchema>;


export function SignupForm({ className, ...props }: React.ComponentProps<"div">) {
  const { signUp } = useAuthStore();
  const navigate = useNavigate(); // chuyển người dùng sang trang đăng nhập nếu đăng ký thành công


  // Sử dụng useForm Hook để lấy dữ liệu của input và kiểm tra xem input có hợp lệ hay khônng và gửi Form
  // Zod sẽ kiểm tra dữ liệu còn react hook form sẽ kiểm tra sự kiện và trạng thái của form
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignUpFormvalues>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpFormvalues) => {
    const { firstname, lastname, username, email, password } = data;
    // Gọi API từ backend để signup 
    await signUp(firstname, lastname, username, email, password)

    navigate("/signin");
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
                <h1 className="text-2xl font-bold"> Tạo tài khoản REALCHAT</h1>
                <p className="text-muted-foreground text-balance">Chào mừng bạn hãy đăng ký để bắt đầu</p>

              </div>
              {/* họ và tên */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="lastname" className="block text-sm"> Họ </Label>
                  <Input
                    type="text"
                    id="lastname"
                    {...register("lastname")}
                  />
                  {/* thông báo lỗi khi không nhập Họ vào */}
                  {errors.lastname && (
                    <p className="text-destructive text-sm"> {errors.lastname.message} </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="firstname" className="block text-sm"> Tên </Label>
                  <Input
                    type="text"
                    id="firstname"
                    {...register("firstname")}
                  />
                  {/* thông báo lỗi khi không nhập Họ vào */}
                  {errors.firstname && (
                    <p className="text-destructive text-sm"> {errors.firstname.message} </p>
                  )}
                </div>
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
              </div>
              {/* email */}
              <div className="flex flex-col gap-3">
                <div className="space-y-2">
                  <Label htmlFor="email" className="block text-sm"> Email </Label>
                  <Input
                    type="email"
                    id="email"
                    placeholder="abc@gmail.com"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-destructive text-sm"> {errors.email.message} </p>
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
                  {/* nút đăng ký */}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    Tạo tài khoản
                  </Button>
                  <div className="text-center text-sm">
                    Đã có tài khoản ? {""}
                    <a href="/signin" className="underline underline-offset-4">Đăng nhập</a>
                  </div>
                </div>
              </div>
            </div>
          </form>
          <div className="bg-muted relative hidden md:block">
            <img
              src="/placeholderSignUp.png"
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
