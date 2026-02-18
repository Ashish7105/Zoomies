"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { verifyEmployee } from "@/lib/employees";

const EMPLOYEE_STORAGE_KEY = "employeeSession";

const EmployeeContext = createContext();

function loadStoredEmployee() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(EMPLOYEE_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveEmployee(employee) {
  if (typeof window === "undefined") return;
  if (employee) {
    localStorage.setItem(EMPLOYEE_STORAGE_KEY, JSON.stringify(employee));
  } else {
    localStorage.removeItem(EMPLOYEE_STORAGE_KEY);
  }
}

export default function EmployeeProvider({ children }) {
  const [employee, setEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setEmployee(loadStoredEmployee());
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    const session = await verifyEmployee({ email, password });
    if (session) {
      setEmployee(session);
      saveEmployee(session);
      return { success: true };
    }
    return { success: false, error: "Invalid email or password." };
  };

  const setSession = (session) => {
    setEmployee(session || null);
    saveEmployee(session || null);
  };

  const logout = () => {
    setEmployee(null);
    saveEmployee(null);
  };

  return (
    <EmployeeContext.Provider
      value={{
        employee,
        isLoading,
        login,
        logout,
        setSession,
        isEmployeeLoggedIn: !!employee,
      }}
    >
      {children}
    </EmployeeContext.Provider>
  );
}

export const useEmployee = () => useContext(EmployeeContext);
