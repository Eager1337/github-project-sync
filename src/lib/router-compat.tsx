/**
 * Thin compatibility layer so pages written against react-router can run on
 * TanStack Router without being rewritten one by one.
 */
import * as React from "react";
import { useRouter, useRouterState, useParams as useTanstackParams } from "@tanstack/react-router";

export function useLocation() {
  const location = useRouterState({ select: (s) => s.location });
  return {
    pathname: location.pathname,
    search: location.searchStr ?? "",
    hash: location.hash ?? "",
    state: (location.state ?? {}) as unknown as Record<string, unknown>,
    key: location.href,
  };
}

export function useNavigate() {
  const router = useRouter();
  return React.useCallback(
    (to: string | number, options?: { replace?: boolean; state?: unknown }) => {
      if (typeof to === "number") {
        router.history.go(to);
        return;
      }
      if (options?.replace) router.history.replace(to, options?.state as never);
      else router.history.push(to, options?.state as never);
    },
    [router],
  );
}

export function useParams<T extends Record<string, string> = Record<string, string>>(): Partial<T> {
  return (useTanstackParams as any)({ strict: false }) as Partial<T>;
}

export function useSearchParams(): [URLSearchParams, (next: URLSearchParams | string) => void] {
  const router = useRouter();
  const searchStr = useRouterState({ select: (s) => s.location.searchStr ?? "" });
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const params = React.useMemo(() => new URLSearchParams(searchStr), [searchStr]);
  const setParams = React.useCallback(
    (next: URLSearchParams | string) => {
      const qs = typeof next === "string" ? next : next.toString();
      router.history.push(qs ? `${pathname}?${qs}` : pathname);
    },
    [router, pathname],
  );
  return [params, setParams];
}

export type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  to: string;
  replace?: boolean;
  state?: unknown;
};

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { to, replace, state, onClick, ...rest },
  ref,
) {
  const router = useRouter();
  return (
    <a
      ref={ref}
      href={to}
      onClick={(event) => {
        onClick?.(event);
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          rest.target === "_blank" ||
          /^(https?:|mailto:|tel:)/.test(to)
        ) {
          return;
        }
        event.preventDefault();
        if (replace) router.history.replace(to, state as never);
        else router.history.push(to, state as never);
      }}
      {...rest}
    />
  );
});

export type NavLinkProps = Omit<LinkProps, "className" | "children"> & {
  end?: boolean;
  className?: string | ((props: { isActive: boolean }) => string);
  children?: React.ReactNode | ((props: { isActive: boolean }) => React.ReactNode);
};

export const NavLink = React.forwardRef<HTMLAnchorElement, NavLinkProps>(function NavLink(
  { className, children, end, to, ...rest },
  ref,
) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = end ? pathname === to : pathname === to || pathname.startsWith(`${to}/`);
  return (
    <Link
      ref={ref}
      to={to}
      className={typeof className === "function" ? className({ isActive }) : className}
      aria-current={isActive ? "page" : undefined}
      {...rest}
    >
      {typeof children === "function" ? children({ isActive }) : children}
    </Link>
  );
});

export function Navigate({ to, replace }: { to: string; replace?: boolean }) {
  const router = useRouter();
  React.useEffect(() => {
    if (replace) router.history.replace(to);
    else router.history.push(to);
  }, [router, to, replace]);
  return null;
}
