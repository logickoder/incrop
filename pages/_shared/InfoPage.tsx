import { ImageIcon, Scissors } from 'lucide-react';

export default function InfoPage(
  {
    message
  }: { message?: string }
) {
  return (
    <div className="hero min-h-[calc(100vh-200px)] bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-lg">
          {
            message ? (
              <h1 className="text-xl font-medium text-error mb-6">
                {message}
              </h1>
            ) : (
              <>
                <div className="flex justify-center mb-8 space-x-4">
                  <ImageIcon
                    className="text-primary w-16 h-16 opacity-70"
                    strokeWidth={1.5}
                  />
                  <Scissors
                    className="text-accent w-16 h-16 opacity-70 transform rotate-45"
                    strokeWidth={1.5}
                  />
                </div>

                <h1 className="text-4xl font-bold text-primary mb-6">
                  Welcome to InCrop
                </h1>

                <p className="mb-8 text-lg text-neutral-600">
                  Inverse image cropping reimagined. Remove the center of your image and seamlessly join the edges in a
                  unique
                  way.
                </p>
              </>
            )
          }

          <div className="bg-base-100 p-6 rounded-xl shadow-sm border border-base-300">
            <h2 className="text-2xl font-semibold text-accent mb-4">
              How InCrop Works
            </h2>
            <ul className="space-y-3 text-left text-neutral-700">
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Select an image from your device</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Choose horizontal or vertical crop mode</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Select the central region to remove</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Preview and download your uniquely cropped image</span>
              </li>
            </ul>
          </div>

          <div className="mt-12 text-sm text-neutral-500 italic">
            Reimagining image cropping, one pixel at a time
          </div>
        </div>
      </div>
    </div>
  );
}