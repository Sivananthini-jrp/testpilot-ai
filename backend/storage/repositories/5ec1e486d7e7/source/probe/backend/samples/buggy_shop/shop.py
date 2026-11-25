PRICES = {"apple": 0.5, "pear": 0.75}


def average(values: list) -> float:
    """Return the mean of values."""
    return sum(values) / len(values)


def first_word(text: str) -> str:
    """Return the first word of text."""
    return text.split()[0]


def paginate(items: list, page: int, size: int) -> list:
    """Return the items on a 1-indexed page."""
    start = page * size
    return items[start:start + size]


def price_of(name: str) -> float:
    """Look up the price of a product."""
    return PRICES[name]


def apply_discount(price: float, percent: float) -> float:
    if percent < 0 or percent > 100:
        raise ValueError("percent must be between 0 and 100")
    return price - price * percent / 100
