#Metrics

##Latency

The Astromo metrics middleware layer was designed to give you an accurate measure of latency on every client's request

### Testing

The following cURL request will report the latency on a request

`curl -s -w %{time_total}ms\\n -o /dev/null http://127.0.0.1:3000/foo`

### Accuracy

Our metrics are measured in nanoseconds, so are as precise as it gets.

We're using the millisecond conversion in the these results however, to better illustrate the intention.

| Astromo Metrics| cURL          |
| -------------- |---------------|
| 69.028ms       | 0.069ms       |
| 92.224ms       | 0.093ms       |
| 57.065ms       | 0.058ms       |
| 60.195ms       | 0.061ms       |
| 104.058ms      | 0.105ms       |
| 92.456ms       | 0.093ms       |
