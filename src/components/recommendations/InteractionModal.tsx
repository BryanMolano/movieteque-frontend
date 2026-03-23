import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../contexts/ToastContext";
import type { RecommendationComplete } from "../../interfaces/RecommendationComplete";

interface Props {
  open: boolean;
  onClose: () => void;
  recommendation: RecommendationComplete | null;
}

export function InteractionModal({ open, onClose, recommendation }: Props) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return (null)
}
