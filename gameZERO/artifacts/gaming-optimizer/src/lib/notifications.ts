import { toast } from "sonner";

export function showSuccess(message: string) {
  toast.success(message, { duration: 3000 });
}

export function showError(message: string) {
  toast.error(message, { duration: 5000 });
}

export function showWarning(message: string) {
  toast.warning(message, { duration: 4000 });
}

export function showInfo(message: string) {
  toast.info(message, { duration: 3000 });
}

export function showThermalAlert(cpuTemp: number, gpuTemp: number) {
  if (cpuTemp > 90 || gpuTemp > 88) {
    toast.error(`Critical Temperature Alert! CPU: ${cpuTemp}°C, GPU: ${gpuTemp}°C`, {
      duration: 8000,
      description: "System may throttle performance. Check cooling immediately."
    });
  } else if (cpuTemp > 83 || gpuTemp > 80) {
    toast.warning(`High Temperature Warning. CPU: ${cpuTemp}°C, GPU: ${gpuTemp}°C`, {
      duration: 5000,
      description: "Consider cleaning dust or improving airflow."
    });
  }
}