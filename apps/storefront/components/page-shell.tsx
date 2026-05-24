import Link from 'next/link';
import {
  Button,
  PageHeader as UiPageHeader,
  EmptyState as UiEmptyState,
  LoadingBlock as UiLoadingBlock,
} from '@nexora/ui';

export function PageHeader(
  props: React.ComponentProps<typeof UiPageHeader>,
) {
  return <UiPageHeader {...props} />;
}

export function LoadingBlock(
  props: React.ComponentProps<typeof UiLoadingBlock>,
) {
  return <UiLoadingBlock {...props} />;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  action,
  className,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  const resolvedAction =
    action ??
    (actionLabel && actionHref ? (
      <Link href={actionHref}>
        <Button variant="luxury">{actionLabel}</Button>
      </Link>
    ) : undefined);

  return (
    <UiEmptyState
      title={title}
      description={description}
      action={resolvedAction}
      className={className}
    />
  );
}
