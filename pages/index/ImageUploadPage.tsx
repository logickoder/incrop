import {
  ChangeEventHandler,
  ClipboardEventHandler,
  DragEventHandler,
  ForwardRefExoticComponent,
  RefAttributes,
  useRef,
  useState
} from 'react';
import { Clipboard, FileImage, ImagePlus, LucideProps, Upload } from 'lucide-react';
import { toast } from 'react-toastify';

export default function ImageUploadPage() {
  const [selectedImage, setSelectedImage] = useState<{
    file: File;
    preview: string | undefined;
  }>();
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect: ChangeEventHandler<HTMLInputElement> = (event) => {
    processImage(event?.target?.files?.[0]);
  };

  const handleDragEnter: DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave: DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
  };

  const handleDrop: DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);

    processImage(event?.dataTransfer?.files?.[0]);
  };

  const handlePaste: ClipboardEventHandler<HTMLDivElement> = (event) => {
    const items = event?.clipboardData?.items;
    if (!items) {
      return;
    }

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        processImage(blob);
        break;
      }
    }
  };

  const processImage = (file: File | undefined | null) => {
    if (file && ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage({
          file: file,
          preview: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    } else {
      toast('Please upload a valid image (JPEG, PNG, or WebP)', { type: 'error' });
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center p-6"
      onPaste={handlePaste}
    >
      <div
        className={`
          w-full max-w-2xl border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300
          ${dragActive
          ? 'border-primary bg-primary/10 scale-105'
          : 'border-neutral-300 hover:border-primary'
        }
        `}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {!selectedImage ? (
          <>
            <Upload className="mx-auto mb-4 w-16 h-16 text-primary" />
            <h2 className="text-2xl font-bold mb-4">Upload Your Image</h2>

            <div className="grid grid-rows-1 sm:grid-cols-3 gap-4 mt-6">
              <Action title="Browse Files" icon={FileImage} onClick={triggerFileInput} />
              <Action title="Paste Image" icon={Clipboard} onClick={triggerFileInput} />
              <Action title="Drag & Drop" icon={ImagePlus} />
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
            />

            <p className="mt-4 text-neutral-500">
              Supports JPEG, PNG, and WebP formats
            </p>
          </>
        ) : (
          <div className="flex flex-col items-center">
            <img
              src={selectedImage?.preview}
              alt="Uploaded preview"
              className="max-h-[400px] rounded-lg mb-4 shadow-lg"
            />
            <div className="flex space-x-4">
              <button
                className="btn btn-primary"
                onClick={() => {/* Navigate to crop page */
                }}
              >
                Start Inverse Cropping
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => setSelectedImage(undefined)}
              >
                Upload Another
              </button>
            </div>
            <p className="mt-2 text-neutral-500">
              {selectedImage.file.name} - {Math.round(selectedImage.file.size / 1024)} KB
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Action(
  {
    title,
    onClick,
    icon: Icon
  }: {
    title: string;
    onClick?: () => void;
    icon: ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>;
  }
) {
  return (
    <button
      className="btn btn-outline h-fit flex flex-row sm:flex-col gap-2 py-2"
      onClick={onClick}
    >
      <Icon className="sm:mx-auto w-6 h-6" />
      {title}
    </button>
  );
}