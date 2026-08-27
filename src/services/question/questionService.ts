import { supabase } from "@/lib/supabase/client";
import { QuestionType } from "@/types";

export type CreateQuestionInput = {
  productId?: string | null;
  name: string;
  email: string;
  phone?: string | null;
  question: string;
  userId?: string | null;
};

/**
 * Storefront service for submitting product questions and contact inquiries
 */
export const questionService = {
  async createQuestion(input: CreateQuestionInput): Promise<QuestionType> {
    const { data, error } = await supabase
      .from("questions")
      .insert({
        product_id: input.productId ?? null,
        name: input.name.trim(),
        email: input.email.trim(),
        phone: input.phone ? input.phone.trim() : null,
        question: input.question.trim(),
        user_id: input.userId ?? null,
        status: "pending",
      })
      .select("*")
      .single();

    if (error) {
      console.error("Error creating question:", error);
      throw error;
    }

    return {
      id: data.id,
      product_id: data.product_id,
      user_id: data.user_id ?? null,
      name: data.name,
      email: data.email,
      phone: data.phone ?? null,
      question: data.question,
      status: data.status,
      created_at: data.created_at ?? undefined,
      updated_at: data.updated_at ?? undefined,
    };
  },
};
