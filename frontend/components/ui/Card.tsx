/* eslint-disable @next/next/no-img-element */
interface CardProps {
  title: string;
  description?: string;
  image?: string;
}

export default function Card({
  title,
  description,
  image,
}: CardProps) {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      {image && (
        <img
          src={image}
          alt={title}
          className="mb-4 h-48 w-full rounded-md object-cover"
        />
      )}

      <h3 className="text-lg font-semibold">{title}</h3>

      {description && (
        <p className="mt-2 text-sm text-gray-600">
          {description}
        </p>
      )}
    </div>
  );
}