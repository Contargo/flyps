let data = signal({ height: 1.8, weight: 78 });

let bmi = signalFn(
  withInputSignals(
    () => data,
    ({ height, weight }) => weight / (height * height)
  )
);

let diagnose = signalFn(
  withInputSignals(
    () => bmi,
    bmi => {
      if (bmi < 18.5) return "underweight";
      if (bmi < 25) return "healthy";
      if (bmi < 30) return "overweight";
      return "obese";
    }
  )
);

let color = signalFn(
  withInputSignals(
    () => diagnose,
    diagnose => {
      switch (diagnose) {
        case "underweight":
        case "overweight":
          return "orange";
        case "healthy":
          return "green";
        default:
          return "red";
      }
    }
  )
);

function slider(key, value, min, max, step = 1) {
  return h("input", {
    attrs: {
      type: "range",
      value,
      min,
      max,
      step
    },
    style: { width: "100%" },
    on: {
      input: function(e) {
        data.update(data => ({
          ...data,
          [key]: e.target.value
        }));
      }
    }
  });
}

function calculator([data, bmi, diagnose, color]) {
  let { height, weight } = data;

  return h("div.bmi", [
    h("h3", "BMI calculator"),
    h("div", [`Height: ${height}m`, slider("height", height, 1.0, 2.2, 0.01)]),
    h("div", [`Weight: ${weight}kg`, slider("weight", weight, 30, 200)]),
    h("p", [
      `BMI: ${Math.round(bmi)}`,
      " - ",
      h("strong", { style: { color: color } }, diagnose)
    ])
  ]);
}

mount(
  mountPoint,
  withInputSignals(() => [data, bmi, diagnose, color], calculator)
);
