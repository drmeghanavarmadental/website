with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

target = '''      fab.onclick = () => {
        pearlState.open = !pearlState.open;
        panel.classList.toggle("open", pearlState.open);
        if (pearlState.open) { pearlGreet(); trackEvent("aasha_open"); setTimeout(() => $("#pearl-in").focus(), 300); }
      };
      $("#pearl-x").onclick = () => { pearlState.open = false; panel.classList.remove("open"); };'''

replacement = '''      fab.onclick = () => {
        pearlState.open = !pearlState.open;
        panel.classList.toggle("open", pearlState.open);
        document.body.style.overflow = pearlState.open ? "hidden" : "";
        if (pearlState.open) { pearlGreet(); trackEvent("aasha_open"); setTimeout(() => $("#pearl-in").focus(), 300); }
      };
      $("#pearl-x").onclick = () => { pearlState.open = false; panel.classList.remove("open"); document.body.style.overflow = ""; };'''

if target in content:
    content = content.replace(target, replacement)
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Successfully updated!")
else:
    print("Target not found.")
