"use client";

import { useState, useMemo } from "react";

import { useGetProductReviews, useCreateReview } from "@/hooks/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ProductType, ReviewType } from "@/types";
import { Star } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { ReviewedCard } from "./reviewed-card";
import { useQueryClient } from "@tanstack/react-query";
import { reviewKeys } from "@/hooks/queries";
import { AnimatePresence, motion } from "motion/react";
import { questionService } from "@/services/question/questionService";

const WHATSAPP_NUMBER = "923193860138";

type ProductDetailsClientProps = {
  product: ProductType;
};

type ActiveForm = "review" | "question" | null;

export function ReviewTab({ product }: ProductDetailsClientProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeForm, setActiveForm] = useState<ActiveForm>(null);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [questionName, setQuestionName] = useState("");
  const [questionEmail, setQuestionEmail] = useState("");
  const [questionText, setQuestionText] = useState("");

  const { data: reviewsData } = useGetProductReviews(product.product_id);
  const createReviewMutation = useCreateReview();

  const reviews = useMemo(() => reviewsData ?? [], [reviewsData]);

  const userReview = useMemo(() => {
    if (!user) return null;
    return (
      reviews.find((review: ReviewType) => review.user_id === user.id) || null
    );
  }, [reviews, user]);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    return (
      reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    );
  }, [reviews]);

  const reviewCount = reviews.length;

  const resetReviewForm = () => {
    setRating(0);
    setComment("");
    setHoveredRating(0);
  };

  const resetQuestionForm = () => {
    setQuestionName("");
    setQuestionEmail("");
    setQuestionText("");
  };

  const handleWriteReview = () => {
    if (!user) {
      toast.error("Please sign in to leave a review");
      return;
    }
    if (userReview) {
      toast.info("You have already reviewed this product");
      return;
    }
    setActiveForm("review");
    resetQuestionForm();
  };

  const handleAskQuestion = () => {
    setActiveForm("question");
    resetReviewForm();
  };

  const handleSubmitReview = async () => {
    if (!user) {
      toast.error("Please sign in to leave a review");
      return;
    }

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (!comment.trim()) {
      toast.error("Please write a comment");
      return;
    }

    setIsSubmitting(true);
    try {
      await createReviewMutation.mutateAsync({
        productId: product.product_id,
        rating,
        comment: comment.trim(),
      });

      await queryClient.refetchQueries({
        queryKey: reviewKeys.list(product.product_id),
      });

      toast.success("Review submitted successfully!");
      resetReviewForm();
      setActiveForm(null);
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitQuestion = async () => {
    if (!questionName.trim() || !questionEmail.trim() || !questionText.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await questionService.createQuestion({
        productId: product.product_id,
        name: questionName.trim(),
        email: questionEmail.trim(),
        question: questionText.trim(),
        userId: user?.id ?? null,
      });

      const message = [
        `Hi! I have a question about "${product.title}".`,
        ``,
        `Name: ${questionName.trim()}`,
        `Email: ${questionEmail.trim()}`,
        ``,
        `Question: ${questionText.trim()}`,
      ].join("\n");

      window.open(
        `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
        "_blank",
        "noopener,noreferrer",
      );

      toast.success("Question submitted!");
      resetQuestionForm();
      setActiveForm(null);
    } catch (error) {
      console.error("Error submitting question:", error);
      toast.error("Failed to submit question. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-foreground mb-10 text-center text-2xl font-semibold tracking-tight">
        Customer Reviews
      </h2>

      <div className="mb-8 flex flex-col items-center justify-between gap-6">
        <div className="flex flex-col items-center">
          {reviewCount > 0 ? (
            <>
              <div className="mb-1 flex items-center gap-2">
                {RenderStars(averageRating, "lg")}
                <span className="text-foreground text-lg font-semibold">
                  {averageRating.toFixed(1)}
                </span>
              </div>
              <p className="text-muted-foreground text-sm">
                Based on {reviewCount.toLocaleString()}{" "}
                {reviewCount === 1 ? "review" : "reviews"}
              </p>
            </>
          ) : (
            <>
              {RenderStars(0, "lg")}
              <p className="text-muted-foreground mt-2 text-sm">
                Be the first to write a review
              </p>
            </>
          )}
        </div>

        <div className="flex w-full max-w-[200px] flex-col gap-2.5 sm:w-auto">
          <Button
            onClick={handleWriteReview}
            disabled={!!userReview}
            className="bg-foreground text-background hover:bg-foreground/90 w-full cursor-pointer"
          >
            Write a review
          </Button>
          <Button
            variant="outline"
            onClick={handleAskQuestion}
            className="border-foreground text-foreground hover:bg-muted w-full cursor-pointer bg-transparent"
          >
            Ask a question
          </Button>
        </div>
      </div>

      <AnimatePresence initial={false} mode="wait">
        {activeForm === "review" && (
          <motion.div
            key="review-form"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-border mb-8 border-t pt-8">
              <h3 className="text-muted-foreground mb-6 text-center text-lg font-medium">
                Write a review
              </h3>
              <div className="mx-auto max-w-md space-y-5">
                <div className="flex flex-col items-center gap-2">
                  <label className="text-muted-foreground text-sm">
                    Rating
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="cursor-pointer focus:outline-none"
                      >
                        <Star
                          className={`h-7 w-7 transition-colors ${
                            star <= (hoveredRating || rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <label className="text-muted-foreground text-sm">
                    Your review
                  </label>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience with this product..."
                    className="min-h-[120px] w-full rounded-lg"
                    maxLength={500}
                  />
                  <div className="text-muted-foreground w-full text-right text-xs">
                    {comment.length}/500
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center gap-2.5 pt-1 sm:flex-row sm:gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setActiveForm(null);
                      resetReviewForm();
                    }}
                    className="border-foreground text-foreground hover:bg-muted w-full max-w-[200px] cursor-pointer bg-transparent sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitReview}
                    disabled={!comment.trim() || rating === 0 || isSubmitting}
                    className="bg-foreground text-background hover:bg-foreground/90 w-full max-w-[200px] cursor-pointer sm:w-auto"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Review"}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeForm === "question" && (
          <motion.div
            key="question-form"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-border mb-8 border-t pt-8">
              <h3 className="text-muted-foreground mb-6 text-center text-lg font-medium">
                Ask a question
              </h3>
              <div className="mx-auto max-w-md space-y-5">
                <div className="flex flex-col items-center gap-2">
                  <label className="text-muted-foreground text-sm">
                    Display name
                  </label>
                  <Input
                    value={questionName}
                    onChange={(e) => setQuestionName(e.target.value)}
                    placeholder="Display name"
                    className="h-11 w-full rounded-lg"
                  />
                </div>

                <div className="flex flex-col items-center gap-2">
                  <label className="text-muted-foreground text-sm">
                    Email address
                  </label>
                  <Input
                    type="email"
                    value={questionEmail}
                    onChange={(e) => setQuestionEmail(e.target.value)}
                    placeholder="Your email address"
                    className="h-11 w-full rounded-lg"
                  />
                </div>

                <div className="flex flex-col items-center gap-2">
                  <label className="text-muted-foreground text-sm">
                    Question
                  </label>
                  <Textarea
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    placeholder="Write your question here"
                    className="min-h-[120px] w-full rounded-lg"
                  />
                </div>

                <div className="flex flex-col items-center justify-center gap-2.5 pt-1 sm:flex-row sm:gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setActiveForm(null);
                      resetQuestionForm();
                    }}
                    className="border-foreground text-foreground hover:bg-muted w-full max-w-[200px] cursor-pointer bg-transparent sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => void handleSubmitQuestion()}
                    disabled={isSubmitting}
                    className="bg-foreground text-background hover:bg-foreground/90 w-full max-w-[200px] cursor-pointer sm:w-auto"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Question"}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {reviewCount > 0 && (
        <div className="mt-4 space-y-4">
          <ReviewedCard productId={product.product_id} />
        </div>
      )}
    </div>
  );
}

export function RenderStars(rating: number, size: "sm" | "md" | "lg" = "md") {
  const sizeClass =
    size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClass} ${
            star <= Math.round(rating)
              ? "fill-yellow-400 text-yellow-400"
              : "text-muted-foreground"
          }`}
        />
      ))}
    </div>
  );
}
