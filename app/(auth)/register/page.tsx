'use client';
import { Button } from "@/components/forms/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/forms/card"
import { Input } from "@/components/forms/input";
import { Label } from "@/components/forms/label";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState("student");
  
  // Adjust allowed domain regex as your uni domains require
  const allowedDomainRegex = /^[^\s@]+@(?:student\.ku\.edu\.np|teacher\.ku\.edu\.np|ku\.edu\.np)$/i;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setError("");
  setMessage("");
  
  if (!allowedDomainRegex.test(email)) {
    setError("Please use your official university email.");
    return;
  }
  
  if (password.length < 6) {
    setError("Password must be at least 6 characters.");
    return;
  }
  
  if (password !== confirmPassword) {
    setError("Passwords do not match.");
    return;
  }

  setLoading(true);

  try {
    const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL}/verify`;

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { 
          role: userType,
          name: name 
        },
        emailRedirectTo: redirectTo,
      },
    });

    if (signUpError) {
      setError(signUpError.message || "Signup failed");
      setLoading(false);
      return;
    }

    // Check if user already exists (Supabase returns this in data)
    if (data?.user?.identities?.length === 0) {
      setError("An account with this email already exists. Please login instead.");
      setLoading(false);
      return;
    }

    // New user - verification email sent
    setMessage(
      "A verification email has been sent to your university inbox. Please open it and confirm your email to activate your account."
    );
  }  catch (err) {
    setError(err instanceof Error ? err.message : "Unknown error");
  } finally {
    setLoading(false);
  }
};

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Sign Up</CardTitle>
        <CardDescription>Create a new account to get started</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Register as</Label>
            <div className="flex gap-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="userType"
                  value="student"
                  checked={userType === "student"}
                  onChange={(e) => setUserType(e.target.value)}
                  className="w-4 h-4 text-primary"
                />
                <span>Student</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="userType"
                  value="teacher"
                  checked={userType === "teacher"}
                  onChange={(e) => setUserType(e.target.value)}
                  className="w-4 h-4 text-primary"
                />
                <span>Teacher</span>
              </label>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder={userType === "student" ? "you@student.ku.edu.np" : "you@teacher.ku.edu.np"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          
          {message && (
            <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
              {message}
            </div>
          )}
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading}
          >
            {loading ? "Creating account..." : "Sign Up"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <div className="text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Login
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}