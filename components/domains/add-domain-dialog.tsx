'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, CheckCircle2, Globe, Loader2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Website } from '@/lib/types';

const PLATFORM_DOMAIN = process.env.NEXT_PUBLIC_PLATFORM_ROOT_DOMAIN || 'univert.pro';
const CUSTOM_DOMAIN_TARGET_HOST = `origin.${PLATFORM_DOMAIN}`;

interface AddDomainDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  websites: Website[];
  onSubmit?: (domain: string, websiteId: string) => void;
}

type Step = 'input' | 'validating' | 'configure';

export function AddDomainDialog({ open, onOpenChange, websites, onSubmit }: AddDomainDialogProps) {
  const [step, setStep] = useState<Step>('input');
  const [domain, setDomain] = useState('');
  const [selectedWebsite, setSelectedWebsite] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateDomain = (d: string): boolean => {
    const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    return domainRegex.test(d);
  };

  const handleDomainChange = (value: string) => {
    setDomain(value.toLowerCase().trim());
    setValidationError(null);
  };

  const handleNext = async () => {
    if (!domain) {
      setValidationError('Please enter a domain name');
      return;
    }

    if (!validateDomain(domain)) {
      setValidationError('Please enter a valid domain name (e.g., example.com)');
      return;
    }

    if (!selectedWebsite) {
      setValidationError('Please select a website');
      return;
    }

    setStep('validating');
    
    // Simulate validation
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setStep('configure');
  };

  const handleSubmit = () => {
    onSubmit?.(domain, selectedWebsite);
    handleClose();
  };

  const handleClose = () => {
    setStep('input');
    setDomain('');
    setSelectedWebsite('');
    setValidationError(null);
    onOpenChange(false);
  };

  const selectedWebsiteData = websites.find((w) => w.id === selectedWebsite);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-card sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {step === 'configure' ? 'Configure DNS' : 'Connect Custom Domain'}
          </DialogTitle>
          <DialogDescription>
            {step === 'input' && 'Add a custom domain to one of your websites.'}
            {step === 'validating' && 'Validating domain availability...'}
            {step === 'configure' && 'Add these DNS records to complete the connection.'}
          </DialogDescription>
        </DialogHeader>

        {step === 'input' && (
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="domain">Domain Name</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="domain"
                  placeholder="example.com"
                  value={domain}
                  onChange={(e) => handleDomainChange(e.target.value)}
                  className={cn(
                    'pl-10 bg-secondary border-border font-mono',
                    validationError && 'border-red-500 focus-visible:ring-red-500/20'
                  )}
                />
              </div>
              {validationError && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {validationError}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Enter your domain without http:// or www
              </p>
            </div>

            <div className="space-y-2">
              <Label>Connect to Website</Label>
              <Select value={selectedWebsite} onValueChange={setSelectedWebsite}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Select a website" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {websites.filter((w) => w.status === 'ready').map((website) => (
                    <SelectItem key={website.id} value={website.id}>
                      <div className="flex items-center gap-2">
                        <span>{website.projectName}</span>
                        <span className="text-muted-foreground text-xs">
                          ({`${website.subdomain}.${PLATFORM_DOMAIN}`})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {domain && validateDomain(domain) && selectedWebsite && (
              <div className="p-3 rounded-lg bg-accent/5 border border-accent/20">
                <p className="text-sm text-foreground">
                  <span className="font-mono text-accent">{domain}</span> will point to{' '}
                  <span className="font-mono text-accent">
                    {selectedWebsiteData ? `${selectedWebsiteData.subdomain}.${PLATFORM_DOMAIN}` : ''}
                  </span>
                </p>
              </div>
            )}
          </div>
        )}

        {step === 'validating' && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-10 h-10 text-accent animate-spin mb-4" />
            <p className="text-sm text-muted-foreground">Checking domain availability...</p>
          </div>
        )}

        {step === 'configure' && (
          <div className="space-y-4 py-4">
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-400">Domain available</p>
                <p className="text-xs text-muted-foreground">
                  {domain} is ready to be connected
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Add these records at your DNS provider:
              </p>

              {/* DNS Records Preview */}
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="grid grid-cols-3 gap-4 px-4 py-2 bg-secondary/50 text-xs font-medium text-muted-foreground uppercase tracking-wider border-b border-border">
                  <div>Type</div>
                  <div>Name</div>
                  <div>Value</div>
                </div>
                <div className="grid grid-cols-3 gap-4 px-4 py-3 text-sm border-b border-border">
                  <Badge variant="outline" className="w-fit bg-green-500/10 text-green-400 border-green-500/20">CNAME</Badge>
                  <code className="font-mono text-foreground">@ / www</code>
                  <code className="font-mono text-muted-foreground">{CUSTOM_DOMAIN_TARGET_HOST}</code>
                </div>
                <div className="grid grid-cols-3 gap-4 px-4 py-3 text-sm">
                  <Badge variant="outline" className="w-fit bg-yellow-500/10 text-yellow-400 border-yellow-500/20">TXT</Badge>
                  <code className="font-mono text-foreground">_univert-verify</code>
                  <code className="font-mono text-muted-foreground">verification token</code>
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {step === 'input' && (
            <Button onClick={handleNext} disabled={!domain || !selectedWebsite}>
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
          {step === 'configure' && (
            <Button onClick={handleSubmit}>
              Add Domain
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
