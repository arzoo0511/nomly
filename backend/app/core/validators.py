from typing import Annotated

from pydantic import AfterValidator


def _non_blank(value: str) -> str:
    stripped = value.strip()
    if not stripped:
        raise ValueError("This field can't be blank")
    return stripped


# A string that is trimmed and rejected if blank/whitespace-only. Field(min_length=...)
# alone isn't enough here since it counts raw characters before trimming, so "   "
# would otherwise pass a min_length=1 check.
NonBlankStr = Annotated[str, AfterValidator(_non_blank)]
