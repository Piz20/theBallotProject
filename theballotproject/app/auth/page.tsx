"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import { differenceInYears, parseISO } from "date-fns";

import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Vote, Cake } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from '@/components/ui/toaster';
import { useToastStore } from '@/hooks/useToastStore';


import { useMutation, useQuery } from "@apollo/client";
import { REGISTER_USER, LOGIN_USER, ME_QUERY } from "@/lib/mutations/userMutations"; // Assurez-vous que vous avez bien ce fichier et cette mutation.
import Loader from "@/components/ui/loader";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  rememberMe: z.boolean().optional(),
});

const registerSchema = z.object({
  name: z.string().nonempty({ message: "Name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string().min(6, { message: "Please confirm your password" }),
  gender: z.string().nonempty({ message: "Gender is required" }),
  dateOfBirth: z
    .string()
    .nonempty({ message: "Date of Birth is required" })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const router = useRouter();
  const { addToast } = useToastStore();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("login");

  // Déclaration des états pour gérer la progression et le processus de soumission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,  // Valeur par défaut pour "se souvenir de moi"
    },
  });


  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      dateOfBirth: "",
      gender: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const [loginUser, { data: loginData, loading: loginLoading, error: loginMutationError }] = useMutation(LOGIN_USER);
  const [registerUser, { data: registerData, loading: registerLoading, error: registerError }] = useMutation(REGISTER_USER);

  const onLoginSubmit = async (formData: LoginFormValues) => {
    setIsSubmitting(true);


    try {
      const response = await loginUser({
        variables: {
          email: formData.email,
          password: formData.password,
          rememberMe: formData.rememberMe,
        },
        context: {
          credentials: 'include',
        },
      });

      const result = response.data.loginUser;

      if (result.success) {
        addToast({
          title: "Success!",
          message: "You have successfully logged in ✅👤 !",
          variant: "success",
        });
        setTimeout(() => {
          router.push("/elections");
        }, 3000);

      } else {
        addToast({
          title: "Error",
          message: result.message || "Invalid credentials.",
          variant: "error",
        });
        setLoginError(result.message || "Invalid credentials.");
      }
    } catch (err) {
      console.error("Login error:", loginMutationError || err);
      addToast({
        title: "Error",
        message: "An error occurred while trying to log in.",
        variant: "error",
      });
      setLoginError("Error when trying to connect.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onRegisterSubmit = async (data: RegisterFormValues) => {
    setIsSubmitting(true);

    try {
      const response = await registerUser({
        variables: {
          email: data.email,
          password: data.password,
          name: data.name,
          gender: data.gender,
          dateOfBirth: data.dateOfBirth,
        },
      });

      const registrationResult = response?.data?.registerUser;

      if (registrationResult?.success) {
        // 🔐 Connexion automatique après succès de l'inscription
        const loginResponse = await loginUser({
          variables: {
            email: data.email,
            password: data.password,
            rememberMe: true, // ou false selon ton choix
          },
          context: {
            credentials: 'include', // 🔑 indispensable pour les cookies de session
          },
        });

        const loginResult = loginResponse?.data?.loginUser;
        if (loginResult?.success) {
          addToast({
            title: "Success!",
            message: "Your account has been created and you're now logged in ✅👤 !",
            variant: "success",
          });

          setTimeout(() => {
            router.push("/elections");
          }, 3000);
        } else {
          addToast({
            title: "Login Failed",
            message: loginResult?.message || "Account created but login failed.",
            variant: "error",
          });
        }
      } else {
        addToast({
          title: "Error",
          message: registrationResult?.message || "Registration failed. Please try again.",
          variant: "error",
        });
        registerForm.setError("root", {
          message: registrationResult?.message || "Registration failed. Please try again.",
        });
      }
    } catch (err: any) {
      console.error("Error registering user:", err);

      const errors = err?.graphQLErrors || err?.response?.errors || err?.errors;

      if (Array.isArray(errors)) {
        errors.forEach((error: any) => {
          let message = error.message;

          // Appliquer les remplacements dans le message pour le toast
          const toastMessage = message
            .replace(/^Email\s*:\s*/i, "")   // Retirer "Email:"
            .replace(/^Date of Birth\s*:\s*/i, "");  // Retirer "Date of Birth:"

          // Afficher le toast avec le message modifié
          addToast({
            title: "Error",
            message: toastMessage,  // Message du toast sans "Email:" ni "Date of Birth:"
            variant: "error",
          });

          // Mettre à jour les erreurs du formulaire en fonction de l'erreur spécifique
          if (message.includes("Email")) {
            registerForm.setError("email", {
              message: message.replace(/^Email\s*:\s*/i, ""),  // Retirer "Email:" dans le message de l'erreur du formulaire
            });
          } else if (message.includes("Date of Birth")) {
            registerForm.setError("dateOfBirth", {
              message: message.replace(/^Date of Birth\s*:\s*/i, ""),  // Retirer "Date of Birth:" dans le message de l'erreur du formulaire
            });
          } else {
            registerForm.setError("root", { message });
          }
        });
      } else {
        const fallbackMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
        addToast({
          title: "Error",
          message: fallbackMessage,
          variant: "error",
        });
        registerForm.setError("root", { message: fallbackMessage });
      }
    } finally {
      setIsSubmitting(false);
    }
  };


  useEffect(() => {
    if (activeTab === "login") {
      document.title = "Login - TheBallotProject";
    } else if (activeTab === "register") {
      document.title = "Register - TheBallotProject";
    }
  }, [activeTab]);


  const { data: meData, loading: meLoading } = useQuery(ME_QUERY, {
    fetchPolicy: "network-only",
  });



  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background to-background/90 flex items-center justify-center p-4 relative overflow-hidden">

      <Toaster />


      <div className="container relative flex flex-col items-center justify-center max-w-md">
        <Link href="/" className="mb-8 text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
          <Vote className="h-8 w-8 heartbeat text-primary" />
          TheBallotProject
        </Link>


        <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="w-full">
            <Card className="w-full bg-card/80 backdrop-blur-md border-border/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
                <CardDescription>Enter your credentials to sign in to your account</CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                  autoComplete="on"
                  className="space-y-4"
                >
                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="email"
                        autoComplete="email"
                        placeholder="name@example.com"
                        className="pl-10"
                        {...loginForm.register("email")}
                      />
                    </div>
                    {loginForm.formState.errors.email && (
                      <p className="text-sm text-destructive">
                        {loginForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link href="/auth/forgot-password" className="text-xs text-primary hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="••••••••"
                        className="pl-10 pr-10"
                        {...loginForm.register("password")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {loginForm.formState.errors.password && (
                      <p className="text-sm text-destructive">
                        {loginForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* Remember me */}
                  <div className="flex items-center space-x-2">
                    <Controller
                      name="rememberMe"
                      control={loginForm.control}
                      defaultValue={false}
                      render={({ field }) => (
                        <>
                          <Checkbox
                            control={loginForm.control}
                            name="rememberMe"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <label
                            htmlFor="rememberMe"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Remember me
                          </label>
                        </>
                      )}
                    />
                  </div>

                  {/* Error message */}
                  {loginError && (
                    <p className="text-sm text-destructive text-center">{loginError}</p>
                  )}

                  {/* Submit */}
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {loginLoading ? "Logging in..." : "Login"}
                  </Button>
                </form>

              </CardContent>
              <CardFooter>
                <p className="text-center text-sm text-muted-foreground w-full">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setActiveTab("register")}
                    className="font-medium text-primary hover:underline"
                  >
                    Sign up
                  </button>
                </p>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="register" className="w-full">
            <Card className="w-full bg-card/80 backdrop-blur-md border-border/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
                <CardDescription>Enter your information to create an account</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">

                  {/* Affichage de l'erreur globale */}
                  {registerForm.formState.errors.root && (
                    <p className="text-sm text-destructive">
                      {registerForm.formState.errors.root.message}
                    </p>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="name"
                        placeholder="John Doe"
                        className="pl-10"
                        {...registerForm.register("name")}
                      />
                    </div>
                    {registerForm.formState.errors.name && (
                      <p className="text-sm text-destructive">{registerForm.formState.errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <div className="relative">
                      <select
                        id="gender"
                        className="w-full pl-10 pr-4 py-2 rounded-md border border-input bg-background text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        {...registerForm.register("gender")}
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                      <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    </div>
                    {registerForm.formState.errors.gender && (
                      <p className="text-sm text-destructive">{registerForm.formState.errors.gender.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date-of-birth">Date of birth</Label>
                    <div className="relative block">
                      <Cake className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="date-of-birth"
                        type="date"
                        className="pl-10 pr-2 w-auto"
                        {...registerForm.register("dateOfBirth")}
                      />
                    </div>
                    {registerForm.formState.errors.dateOfBirth && (
                      <p className="text-sm text-destructive">
                        {registerForm.formState.errors.dateOfBirth.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="register-email"
                        placeholder="name@example.com"
                        className="pl-10"
                        {...registerForm.register("email")}
                      />
                    </div>
                    {registerForm.formState.errors.email && (
                      <p className="text-sm text-destructive">{registerForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="register-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 pr-10"
                        {...registerForm.register("password")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {registerForm.formState.errors.password && (
                      <p className="text-sm text-destructive">{registerForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 pr-10"
                        {...registerForm.register("confirmPassword")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {registerForm.formState.errors.confirmPassword && (
                      <p className="text-sm text-destructive">{registerForm.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Signing up..." : "Sign up"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
              <CardFooter>
                <p className="text-center text-sm text-muted-foreground w-full">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setActiveTab("login")}
                    className="font-medium text-primary hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              </CardFooter>
            </Card>
          </TabsContent>

        </Tabs>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          © Laforge – All rights reserved 2025
        </p>

      </div>
    </div >
  );
}
