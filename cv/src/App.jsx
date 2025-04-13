import React, { useState } from 'react';
import { Upload, Image as ImageIcon, ArrowRight, Loader2, Info, Circle, LineChart } from 'lucide-react';

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [outputImage, setOutputImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      title: "Edge Detection",
      description: "The first step in the Hough Transform is edge detection. This process identifies points in the image where the brightness changes sharply, typically indicating edges of objects.",
      image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=60",
    },
    {
      title: "Parameter Space Mapping",
      description: "Each edge point is transformed into a sinusoidal curve in the parameter space (ρ,θ). This represents all possible lines that could pass through that point.",
      image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&auto=format&fit=crop&q=60",
    },
    {
      title: "Accumulator Array",
      description: "The parameter space is discretized into a grid. Each cell accumulates 'votes' from the transformed curves. Peaks in this accumulator array represent likely lines in the original image.",
      image: "https://images.unsplash.com/photo-1635070041544-22beaf095c06?w=800&auto=format&fit=crop&q=60",
    },
    {
      title: "Line Detection",
      description: "Local maxima in the accumulator array are identified. Each maximum corresponds to parameters (ρ,θ) that define a line in the original image.",
      image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=60",
    }
  ];

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setIsProcessing(true);
        setError(null);
        
        const reader = new FileReader();
        reader.onloadend = () => {
          setSelectedImage(reader.result);
        };
        reader.readAsDataURL(file);
  
        const formData = new FormData();
        formData.append('image', file);
  
        const response = await fetch('http://localhost:5000/process-image', {
          method: 'POST',
          body: formData,
        });
  
        if (!response.ok) {
          throw new Error('Failed to process image');
        }
        
        const data = await response.json();
        // Fix the URL by prepending the base server URL if it's a relative path
        const processedImageUrl = data.processedImageUrl.startsWith('http') 
          ? data.processedImageUrl 
          : `http://localhost:5000${data.processedImageUrl}`;
          
        setOutputImage(processedImageUrl);
      } catch (err) {
        setError('Failed to process image. Please try again.');
        console.error('Error processing image:', err);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-indigo-600 text-white p-4 shadow-lg">
        <div className="container mx-auto flex items-center">
          <ImageIcon className="w-6 h-6 mr-2" />
          <h1 className="text-xl font-bold">Computer Vision: Hough Transform</h1>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 flex-grow">
        {/* How It Works Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">How Hough Transform Works</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-2xl font-semibold mb-4">Understanding Hough Transform</h3>
              <p className="text-gray-700 mb-6">
                The Hough Transform is a powerful technique in computer vision that can detect geometric shapes, particularly lines, in images. It works by transforming points in image space to curves in a parameter space, making it easier to detect shapes through a voting procedure.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Circle className="w-6 h-6 text-indigo-600" />
                  <span className="text-gray-700">Robust to noise and partial occlusions</span>
                </div>
                <div className="flex items-center gap-3">
                  <LineChart className="w-6 h-6 text-indigo-600" />
                  <span className="text-gray-700">Can detect multiple lines simultaneously</span>
                </div>
                <div className="flex items-center gap-3">
                  <Info className="w-6 h-6 text-indigo-600" />
                  <span className="text-gray-700">Used in various computer vision applications</span>
                </div>
              </div>
            </div>
            
            {/* Interactive Steps */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between mb-6">
                  {steps.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveStep(index)}
                      className={`w-8 h-8 rounded-full ${
                        activeStep === index
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
                <div className="mb-6">
                  <img
                    src={steps[activeStep].image}
                    alt={steps[activeStep].title}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <h4 className="text-xl font-semibold mb-2">{steps[activeStep].title}</h4>
                  <p className="text-gray-600">{steps[activeStep].description}</p>
                </div>
                <div className="flex justify-between">
                  <button
                    onClick={() => setActiveStep((prev) => (prev > 0 ? prev - 1 : prev))}
                    className="px-4 py-2 text-indigo-600 disabled:text-gray-400"
                    disabled={activeStep === 0}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setActiveStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev))}
                    className="px-4 py-2 text-indigo-600 disabled:text-gray-400"
                    disabled={activeStep === steps.length - 1}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Section */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-4">About Hough Transform</h2>
              <p className="text-gray-700 mb-4">
                The Hough Transform is a feature extraction technique used in image processing
                and computer vision. It was initially designed to identify lines in images,
                but has been extended to identify positions of arbitrary shapes, most commonly
                circles or ellipses.
              </p>
              <p className="text-gray-700 mb-4">
                This project demonstrates the application of the Hough Transform to detect
                lines in uploaded images. The algorithm works by converting image points into
                parameter space, making it easier to detect geometric patterns.
              </p>
            </div>

            {/* Upload Section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Upload Image</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                  disabled={isProcessing}
                />
                <label
                  htmlFor="image-upload"
                  className={`cursor-pointer flex flex-col items-center ${isProcessing ? 'opacity-50' : ''}`}
                >
                  <Upload className="w-12 h-12 text-gray-400 mb-4" />
                  <span className="text-gray-600">
                    {isProcessing ? 'Processing...' : 'Click to upload an image'}
                  </span>
                  <span className="text-sm text-gray-500 mt-2">
                    Supported formats: PNG, JPG
                  </span>
                </label>
              </div>
              {error && (
                <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg">
                  {error}
                </div>
              )}
              {selectedImage && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Selected Image:</p>
                  <img
                    src={selectedImage}
                    alt="Selected"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Section - Output */}
          <div className="bg-white p-6 rounded-lg shadow-md">
  <h2 className="text-2xl font-bold mb-4">Output</h2>
  {isProcessing ? (
    <div className="flex flex-col items-center justify-center h-96">
      <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
      <p className="text-gray-600">Processing image...</p>
    </div>
  ) : !selectedImage ? (
    <div className="flex flex-col items-center justify-center h-96 border-2 border-dashed border-gray-300 rounded-lg">
      <ImageIcon className="w-12 h-12 text-gray-400 mb-4" />
      <p className="text-gray-600">Upload an image to see the Hough Transform result</p>
    </div>
  ) : (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="text-center">
          <p className="text-sm font-medium text-gray-600 mb-2">Input Image</p>
          <div className="w-full h-72 rounded-lg overflow-hidden">
            <img
              src={selectedImage}
              alt="Input"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-sm font-medium text-gray-600 mb-2">Detected Lines</p>
          {outputImage ? (
            <div className="w-full h-72 rounded-lg overflow-hidden">
              <img
                src={outputImage}
                alt="Output"
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="w-full h-72 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Processing failed</p>
            </div>
          )}
        </div>
      </div>
      
      {outputImage && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Detection Results</h4>
          <p className="text-sm text-gray-600">
            Image processed successfully. The red lines represent detected edges using the Hough Transform algorithm.
          </p>
        </div>
      )}
    </div>
  )}
</div>
        </div>
      </div>
    </div>
  );
}

export default App;