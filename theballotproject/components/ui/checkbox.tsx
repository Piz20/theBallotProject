'use client';

import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import { Controller } from 'react-hook-form';  // N'oublie pas d'importer Controller

import { cn } from '@/lib/utils';

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & {
    name: string;  // Ajout du `name` ici pour qu'il soit contrôlé par `react-hook-form`
    control: any;  // Le `control` de react-hook-form
  }
>(({ className, name, control, ...props }, ref) => (
  <Controller
    control={control}
    name={name}
    defaultValue={false} // Par défaut, non coché
    render={({ field }) => (
      <CheckboxPrimitive.Root
        ref={ref}
        checked={field.value}
        onCheckedChange={field.onChange}  // Met à jour la valeur quand la case change
        className={cn(
          'peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
          className
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator
          className={cn('flex items-center justify-center text-current')}
        >
          <Check className="h-4 w-4" />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
    )}
  />
));

Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
