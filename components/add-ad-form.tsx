"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

// Custom Range Slider Component (custom control)
interface RangeSliderProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  label: string;
}

function RangeSlider({ value, onChange, min, max, step, label }: RangeSliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm font-semibold text-white">${value.toLocaleString()}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb:appearance-none slider-thumb:w-4 slider-thumb:h-4 slider-thumb:rounded-full slider-thumb:bg-blue-600 hover:slider-thumb:bg-blue-700 active:slider-thumb:scale-110 transition-all"
        style={{
          background: `linear-gradient(to right, rgb(37, 99, 235) 0%, rgb(37, 99, 235) ${
            ((value - min) / (max - min)) * 100
          }%, rgb(229, 231, 235) ${((value - min) / (max - min)) * 100}%, rgb(229, 231, 235) 100%)`,
        }}
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>${min.toLocaleString()}</span>
        <span>${max.toLocaleString()}</span>
      </div>
    </div>
  );
}

// Step 1 Schema - Campaign Basic Info
const step1Schema = z.object({
  campaign_name: z
    .string()
    .min(3, "Campaign name must be at least 3 characters")
    .max(100, "Campaign name must not exceed 100 characters")
    .regex(/^[a-zA-Z0-9\s\-_]+$/, "Campaign name can only contain letters, numbers, spaces, hyphens, and underscores"),
  platform: z.enum(["Facebook", "Google", "Instagram", "TikTok", "LinkedIn", "Twitter"]),
  ad_type: z.enum(["Image", "Video", "Carousel", "Text", "Story"]),
});

// Step 2 Schema - Budget & Schedule
const step2Schema = z
  .object({
    budget: z
      .number()
      .min(100, "Budget must be at least $100")
      .max(1000000, "Budget cannot exceed $1,000,000")
      .refine((val) => val >= 100, {
        message: "Budget is too low for an effective campaign",
      }),
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.end_date) {
        const start = new Date(data.start_date);
        const end = new Date(data.end_date);
        return end > start;
      }
      return true;
    },
    {
      message: "End date must be after start date",
      path: ["end_date"],
    }
  );

// Step 3 Schema - Targeting
const step3Schema = z.object({
  target_audience: z
    .string()
    .min(10, "Please provide more details about your target audience")
    .max(500, "Target audience description is too long")
    .refine((val) => val.split(",").length >= 2, {
      message: "Please include at least 2 targeting criteria separated by commas",
    }),
  status: z.enum(["draft", "active", "paused"]),
});

// Combined schema using intersection
const fullFormSchema = step1Schema.and(step2Schema).and(step3Schema);

type FormValues = z.infer<typeof fullFormSchema>;

// Function overloads
function getStepSchema(step: 1): typeof step1Schema;
function getStepSchema(step: 2): typeof step2Schema;
function getStepSchema(step: 3): typeof step3Schema;
function getStepSchema(step: number) {
  switch (step) {
    case 1:
      return step1Schema;
    case 2:
      return step2Schema;
    case 3:
      return step3Schema;
    default:
      return step1Schema;
  }
}

interface AddAdFormProps {
  userId: number;
  onSuccess: () => void;
}

export default function AddAdForm({ userId, onSuccess }: AddAdFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(fullFormSchema),
    defaultValues: {
      campaign_name: "",
      platform: "Facebook",
      ad_type: "Image",
      budget: 1000,
      start_date: "",
      end_date: "",
      target_audience: "",
      status: "draft",
    },
    mode: "onChange",
  });

  const steps = [
    { number: 1, title: "Campaign Info", fields: ["campaign_name", "platform", "ad_type"] },
    { number: 2, title: "Budget & Schedule", fields: ["budget", "start_date", "end_date"] },
    { number: 3, title: "Targeting", fields: ["target_audience", "status"] },
  ];

  // Type predicate to check if form values are valid for current step
  function isStepValid(step: number): boolean {
    let stepSchema;
    if (step === 1) {
      stepSchema = getStepSchema(1);
    } else if (step === 2) {
      stepSchema = getStepSchema(2);
    } else {
      stepSchema = getStepSchema(3);
    }
    const currentValues = form.getValues();
    const result = stepSchema.safeParse(currentValues);
    return result.success;
  }

  async function handleNext() {
    const stepFields = steps[currentStep - 1].fields as Array<keyof FormValues>;
    const isValid = await form.trigger(stepFields);

    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  }

  function handleBack() {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/ads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          user_id: userId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create ad");
      }

      onSuccess();
      form.reset();
      setCurrentStep(1);
    } catch (error) {
      console.error("Error creating ad:", error);
      alert("Failed to create ad. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                  currentStep > step.number
                    ? "bg-white text-black"
                    : currentStep === step.number
                    ? "bg-white text-black ring-4 ring-white/30 animate-pulse"
                    : "bg-white/20 text-white/50"
                }`}
              >
                {currentStep > step.number ? <Check className="w-5 h-5" /> : step.number}
              </div>
              <span
                className={`text-xs mt-2 font-medium ${
                  currentStep === step.number ? "text-white" : "text-white/50"
                }`}
              >
                {step.title}
              </span>
            </div>
          ))}
        </div>
        <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="absolute h-full bg-white transition-all duration-500 ease-out"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Step 1: Campaign Info */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-fade-in">
              <FormField
                control={form.control}
                name="campaign_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campaign Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Summer Sale 2026"
                        {...field}
                        className="focus:ring-2 focus:ring-white"
                      />
                    </FormControl>
                    <FormDescription>
                      Give your campaign a unique, descriptive name
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="platform"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Platform</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-white ring-offset-background focus:ring-2 focus:ring-white focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="Facebook" className="bg-black text-white">Facebook</option>
                        <option value="Google" className="bg-black text-white">Google</option>
                        <option value="Instagram" className="bg-black text-white">Instagram</option>
                        <option value="TikTok" className="bg-black text-white">TikTok</option>
                        <option value="LinkedIn" className="bg-black text-white">LinkedIn</option>
                        <option value="Twitter" className="bg-black text-white">Twitter</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ad_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ad Type</FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-5 gap-2">
                        {["Image", "Video", "Carousel", "Text", "Story"].map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => field.onChange(type)}
                            className={`px-4 py-2 rounded-md border-2 transition-all font-medium ${
                              field.value === type
                                ? "border-white bg-white text-black"
                                : "border-white/20 hover:border-white/40 hover:bg-white/5"
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Step 2: Budget & Schedule */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-fade-in">
              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campaign Budget</FormLabel>
                    <FormControl>
                      <Controller
                        name="budget"
                        control={form.control}
                        render={({ field }) => (
                          <RangeSlider
                            value={field.value}
                            onChange={field.onChange}
                            min={100}
                            max={50000}
                            step={100}
                            label="Total Budget"
                          />
                        )}
                      />
                    </FormControl>
                    <FormDescription>
                      Set your total campaign budget (minimum $100)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          className="focus:ring-2 focus:ring-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          className="focus:ring-2 focus:ring-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          {/* Step 3: Targeting */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-fade-in">
              <FormField
                control={form.control}
                name="target_audience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Audience</FormLabel>
                    <FormControl>
                      <textarea
                        {...field}
                        placeholder="Age 25-40, Interested in technology, Lives in urban areas, etc."
                        className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-white placeholder:text-white/50 ring-offset-background focus:ring-2 focus:ring-white focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </FormControl>
                    <FormDescription>
                      Describe your target audience (include at least 2 criteria separated by commas)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Status</FormLabel>
                    <FormControl>
                      <div className="flex gap-4">
                        {[
                          { value: "draft", label: "Draft", color: "gray" },
                          { value: "active", label: "Active", color: "green" },
                          { value: "paused", label: "Paused", color: "yellow" },
                        ].map((status) => (
                          <button
                            key={status.value}
                            type="button"
                            onClick={() => field.onChange(status.value)}
                            className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all font-medium ${
                              field.value === status.value
                                ? "border-white bg-white text-black ring-2 ring-white/30"
                                : "border-white/20 hover:border-white/40 hover:bg-white/5"
                            }`}
                          >
                            {status.label}
                          </button>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="hover:bg-accent active:scale-95 transition-all"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            {currentStep < 3 ? (
              <Button
                type="button"
                onClick={handleNext}
                className="bg-white text-black hover:bg-white/90 active:scale-95 transition-all"
              >
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-white text-black hover:bg-white/90 active:scale-95 transition-all"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </span>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Create Campaign
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
