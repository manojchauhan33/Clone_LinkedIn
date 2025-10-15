import React, { forwardRef, memo } from "react";

interface PostTextareaProps {
  defaultValue?: string;
  disabled?: boolean;
}

const PostTextarea = memo(
  forwardRef<HTMLTextAreaElement, PostTextareaProps>(({ defaultValue, disabled }, ref) => {
    // console.log("Textarea rendered");
    return (
      <textarea
        ref={ref}
        defaultValue={defaultValue}
        placeholder="What do you want to talk about?"
        className="w-full text-lg p-2 rounded resize-none min-h-[100px] focus:outline-none"
        disabled={disabled}
      />
    );
  })
);

export default PostTextarea;
