import { fireEvent, render, screen } from "@testing-library/react";
import { attachEditorialSoundEvents } from "@raioviajante/design/editorial-sound";
import { PostSearch } from "@/components/PostSearch";

const posts = [
  {
    slug: "sweep",
    title: "A TOML File",
    description: "Sweep configuration",
    tags: ["python"],
  },
  {
    slug: "orbit",
    title: "Execution states",
    description: "Orbit scheduler",
    tags: ["java"],
  },
];

describe("post search", () => {
  it("finds published posts by title, description, and tag", () => {
    render(<PostSearch posts={posts} />);
    const input = screen.getByRole("searchbox", { name: "Search" });
    fireEvent.change(input, { target: { value: "python" } });
    expect(screen.getByRole("link", { name: "A TOML File" })).toHaveAttribute(
      "href",
      "/posts/sweep",
    );
    expect(
      screen.queryByRole("link", { name: "Execution states" }),
    ).not.toBeInTheDocument();
  });
  it("focuses the search box with slash", () => {
    render(<PostSearch posts={posts} />);
    fireEvent.keyDown(document, { key: "/" });
    expect(screen.getByRole("searchbox", { name: "Search" })).toHaveFocus();
  });

  it("plays a key sound only for typed or deleted search text", () => {
    render(<PostSearch posts={posts} />);
    const input = screen.getByRole("searchbox", { name: "Search" });
    const play = jest.fn();
    const detach = attachEditorialSoundEvents(play);

    fireEvent.input(input, { inputType: "insertText", data: "a" });
    fireEvent.input(input, { inputType: "deleteContentBackward" });
    fireEvent.input(input, { inputType: "insertFromPaste", data: "pasted" });

    expect(play).toHaveBeenCalledTimes(2);
    expect(play).toHaveBeenCalledWith("typing", "click");
    detach();
    fireEvent.input(input, { inputType: "insertText", data: "b" });
    expect(play).toHaveBeenCalledTimes(2);
  });
});
