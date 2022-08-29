const deleteProduct = async (button: HTMLButtonElement) => {
  const productId = (button.parentNode?.querySelector('input[name=productId]') as HTMLInputElement).value;
  const csrfToken = (button.parentNode?.querySelector('input[name=_csrf]') as HTMLInputElement).value;
  const productElement = button.closest('article') as HTMLDivElement;

  try {
    const result = await fetch(`/admin/product/${productId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken,
      },
    });
    const data = await result.json();
    productElement.remove();
  } catch (error) {
    console.log(error);
  }
};
