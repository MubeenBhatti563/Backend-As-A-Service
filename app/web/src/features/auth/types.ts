export type Line = {
  kind: "command" | "output" | "step" | "done";
  text: string;
};

// ------------ Login Page -------------
export interface LoginValues {
  email: string;
  password: string;
  remember: boolean;
}
export type LoginErrors = Partial<Record<"email" | "password", string>>;
