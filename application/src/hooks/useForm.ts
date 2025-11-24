import { useState } from 'react';

interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
}

interface UseFormOptions<T> {
  initialValues: T;
  validate?: (values: T) => Partial<Record<keyof T, string>>;
  onSubmit: (values: T) => void | Promise<void>;
}

export const useForm = <T extends Record<string, any>>({
  initialValues,
  validate,
  onSubmit,
}: UseFormOptions<T>) => {
  const [formState, setFormState] = useState<FormState<T>>({
    values: initialValues,
    errors: {},
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (name: keyof T, value: any) => {
    setFormState((prev) => ({
      ...prev,
      values: {
        ...prev.values,
        [name]: value,
      },
      errors: {
        ...prev.errors,
        [name]: undefined,
      },
    }));
  };

  const handleSubmit = async () => {
    if (validate) {
      const errors = validate(formState.values);
      if (Object.keys(errors).length > 0) {
        setFormState((prev) => ({ ...prev, errors }));
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formState.values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormState({
      values: initialValues,
      errors: {},
    });
  };

  return {
    values: formState.values,
    errors: formState.errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    resetForm,
  };
};
