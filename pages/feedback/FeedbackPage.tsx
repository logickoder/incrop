import { FormEvent, useState, useTransition } from 'react';
import { Mail, MessageCircle, Send, User } from 'lucide-react';
import { useToast } from '../../renderer/toast';

interface FeedbackPageState {
  feedback?: string;
  name?: string;
  email?: string;
}

export default function FeedbackPage() {
  const [state, setState] = useState<FeedbackPageState>({});
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  const feedback = state?.feedback || '';

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (isPending) {
      return;
    } else if (!feedback.trim()) {
      toast.error('Please enter your feedback before submitting.');
      return;
    }

    startTransition(async function() {
      try {
        await fetch(
          'https://formspree.io/f/xwpqkkzp',
          {
            method: 'POST',
            body: JSON.stringify(state),
            headers: {
              'Accept': 'application/json'
            }
          }
        );
        toast.success('Thank you for your feedback! We appreciate your input.');
        setState({});
      } catch (e) {
        console.error(e);
        toast.error('An error occurred while sending your feedback. Please try again later.');
      }
    });
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-base-100 rounded-2xl p-8 shadow-lg border border-base-300">
        <div className="flex items-center gap-3 mb-6">
          <MessageCircle className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-base-content">Share Your Feedback</h1>
            <p className="text-base-content/70 mt-1">Help us improve InCrop with your thoughts and suggestions</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" action="https://formspree.io/f/xwpqkkzp" method="POST">
          <div className="form-control">
            <label className="label">
              <span className="label-text flex items-center gap-2">
                <User className="w-4 h-4" />
                Your Name (optional)
              </span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="Enter your name"
              value={state?.name || ''}
              onChange={(e) => setState((prev) => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Your Email (optional)
              </span>
            </label>
            <input
              type="email"
              className="input input-bordered w-full"
              placeholder="Enter your email address"
              value={state?.email || ''}
              onChange={(e) => setState((prev) => ({ ...prev, email: e.target.value }))}
            />
            <label className="label">
              <span className="label-text-alt text-base-content/60">
                We&#39;ll only use this to follow up on your feedback if needed
              </span>
            </label>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">
                Your Feedback <span className="text-error">*</span>
              </span>
            </label>
            <textarea
              className="textarea textarea-bordered w-full h-32 resize-none"
              placeholder="Tell us what you think about InCrop, report bugs, suggest features, or share your experience..."
              value={feedback}
              onChange={(e) => setState((prev) => ({ ...prev, feedback: e.target.value }))}
              required
            />
            <label className="label">
              <span className="label-text-alt text-base-content/60">
                {feedback.length}/1000 characters
              </span>
            </label>
          </div>

          <button
            type="submit"
            className={`btn btn-primary w-full gap-2 ${isPending ? 'loading' : ''}`}
            disabled={isPending}
          >
            {!isPending && <Send className="w-4 h-4" />}
            {isPending ? 'Sending...' : 'Send Feedback'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-base-200 rounded-lg">
          <h3 className="font-semibold text-base-content mb-2">What kind of feedback are you looking for?</h3>
          <ul className="text-sm text-base-content/70 space-y-1">
            <li>• Bug reports and technical issues</li>
            <li>• Feature requests and suggestions</li>
            <li>• User experience improvements</li>
            <li>• Performance feedback</li>
            <li>• General thoughts and comments</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
